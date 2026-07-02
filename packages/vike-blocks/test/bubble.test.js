// The bubble block: a chat message bubble (registerBlock) that holds a plain string or a rich body of
// nested blocks, aligned by sender. The renderer is not node:test-tested (JSX/Vue), so this covers the
// agnostic builder + the resolve (sender normalization + recursive body) plus the shared alignment style.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bubble, definePage, resolvePage, hasBlock } from '../index.js'
import { bubbleRowStyle } from '../bubble-styles.js'

// The bespoke `markdown` block has no fluent builder (it is authored as a raw descriptor), so a rich
// bubble body uses the plain block descriptor form.
const md = (source) => ({ block: 'markdown', source })

test('bubble is registered', () => {
  assert.ok(hasBlock('bubble'))
})

test('the builder holds a string body and defaults to the assistant', () => {
  assert.deepEqual(bubble('Hello there').build(), { block: 'bubble', from: 'assistant', text: 'Hello there' })
  assert.deepEqual(bubble('How do I migrate?').from('user').build(), { block: 'bubble', from: 'user', text: 'How do I migrate?' })
})

test('the builder holds a rich body of nested blocks', () => {
  assert.deepEqual(bubble([md('Run **migrate**.')]).build(), {
    block: 'bubble',
    from: 'assistant',
    sections: [{ block: 'markdown', source: 'Run **migrate**.' }],
  })
})

test('resolve normalizes the sender and passes a string body through', () => {
  const out = resolvePage(definePage({ sections: [bubble('Hi').from('user')] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'bubble')
  assert.equal(r.from, 'user')
  assert.equal(r.text, 'Hi')
  assert.equal(r.sections, null)
})

test('an unknown sender falls back to the assistant', () => {
  const out = resolvePage(definePage({ sections: [bubble('Hi').from('robot')] }))
  assert.equal(out.sections[0].resolved.from, 'assistant')
})

test('resolve recursively resolves a rich body', () => {
  const out = resolvePage(definePage({ sections: [bubble([md('# Hi')]).from('assistant')] }))
  const r = out.sections[0].resolved
  assert.equal(r.text, null)
  assert.equal(r.sections.length, 1)
  assert.equal(r.sections[0].block, 'markdown')
  assert.deepEqual(r.sections[0].resolved, { source: '# Hi' })
})

test('the row aligns by sender', () => {
  assert.equal(bubbleRowStyle('user').justifyContent, 'flex-end')
  assert.equal(bubbleRowStyle('assistant').justifyContent, 'flex-start')
})
