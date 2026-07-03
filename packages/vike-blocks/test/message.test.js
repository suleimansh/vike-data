// The message block: a chat message (registerBlock) that composes a `bubble` with avatar / author /
// timestamp metadata. The renderer is not node:test-tested (JSX/Vue), so this covers the agnostic
// builder (folding the body into a nested bubble descriptor) + the recursive resolve, plus the shared
// avatar-initials helper.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { message, definePage, resolvePage, hasBlock } from '../index.js'
import { avatarInitials } from '../blocks/message-styles.js'

test('message is registered', () => {
  assert.ok(hasBlock('message'))
})

test('the builder folds the body into a nested bubble and defaults to the assistant', () => {
  assert.deepEqual(message().author('Rudder').body('Hi').build(), {
    block: 'message',
    from: 'assistant',
    author: 'Rudder',
    bubble: { block: 'bubble', from: 'assistant', text: 'Hi' },
  })
  // the sender flows into the nested bubble; author + timestamp pass through
  assert.deepEqual(message().from('user').author('You').at('9:41 AM').body('Hey').build(), {
    block: 'message',
    from: 'user',
    author: 'You',
    at: '9:41 AM',
    bubble: { block: 'bubble', from: 'user', text: 'Hey' },
  })
})

test('a rich body folds into a bubble of nested blocks', () => {
  const built = message().body([{ block: 'markdown', source: '# Hi' }]).build()
  assert.deepEqual(built.bubble, { block: 'bubble', from: 'assistant', sections: [{ block: 'markdown', source: '# Hi' }] })
})

test('resolve normalizes the sender and resolves the nested bubble', () => {
  const out = resolvePage(definePage({ sections: [message().from('user').author('You').at('now').body('Hello')] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'message')
  assert.equal(r.from, 'user')
  assert.equal(r.author, 'You')
  assert.equal(r.at, 'now')
  assert.equal(r.bubble.block, 'bubble')
  assert.equal(r.bubble.resolved.text, 'Hello')
  assert.equal(r.bubble.resolved.from, 'user')
})

test('an unknown sender falls back to the assistant', () => {
  const out = resolvePage(definePage({ sections: [message().from('robot').body('Hi')] }))
  assert.equal(out.sections[0].resolved.from, 'assistant')
})

test('avatarInitials derives initials from the author, else falls back by sender', () => {
  assert.equal(avatarInitials('Ada Lovelace', 'assistant'), 'AL')
  assert.equal(avatarInitials('Rudder', 'assistant'), 'R')
  // 3+ word author -> first + last initial, the same canonical `initials` the avatar block uses.
  assert.equal(avatarInitials('Grace Brewster Hopper', 'assistant'), 'GH')
  assert.equal(avatarInitials(null, 'user'), 'U')
  assert.equal(avatarInitials(null, 'assistant'), 'AI')
})
