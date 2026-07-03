// The message-scroller block: a container (registerBlock) for a list of messages with a viewport
// height. The stick-to-bottom + jump button are renderer-local UI state (not node:test-tested), so
// this covers the agnostic builder + the recursive resolve of the message list + the default height.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { messageScroller, message, definePage, resolvePage, hasBlock } from '../index.js'
import { scrollerViewportStyle, AT_BOTTOM_THRESHOLD } from '../blocks/message-scroller-styles.js'

test('message-scroller is registered', () => {
  assert.ok(hasBlock('message-scroller'))
})

test('the builder collapses the messages and carries an optional height', () => {
  const built = messageScroller([message().from('user').body('Hi')]).height('20rem').build()
  assert.equal(built.block, 'message-scroller')
  assert.equal(built.maxHeight, '20rem')
  assert.equal(built.messages.length, 1)
  assert.equal(built.messages[0].block, 'message')
  assert.deepEqual(messageScroller().build(), { block: 'message-scroller', messages: [] }) // empty
})

test('resolve recursively resolves the message list and defaults the height', () => {
  const out = resolvePage(
    definePage({ sections: [messageScroller([message().from('user').body('Hi'), message().from('assistant').body('Hello')])] }),
  )
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'message-scroller')
  assert.equal(r.maxHeight, '24rem') // default
  assert.deepEqual(r.messages.map((s) => s.block), ['message', 'message'])
  assert.equal(r.messages[1].resolved.bubble.resolved.text, 'Hello')
})

test('the viewport scrolls within the capped height', () => {
  const s = scrollerViewportStyle('20rem')
  assert.equal(s.maxHeight, '20rem')
  assert.equal(s.overflowY, 'auto')
  assert.ok(AT_BOTTOM_THRESHOLD > 0)
})
