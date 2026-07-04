// The timeline block: a fluent builder for a vertical activity feed of events, each with a tone-colored
// dot and a string-or-nested-blocks body resolved recursively. Renderers (react/vue) are not
// node:test-tested (JSX/Vue); this covers the agnostic authoring + resolve + the tone->color map.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { timeline, text, definePage, resolvePage, hasBlock } from '../index.js'
import { timelineDotColor } from '../blocks/timeline-styles.js'

test('timeline is registered', () => {
  assert.ok(hasBlock('timeline'))
})

test('the builder collapses to a descriptor; a nested-block body is collapsed too', () => {
  const desc = timeline()
    .item('Placed', { time: '09:41', tone: 'success' })
    .item('Note', { body: [text('Hi')] })
    .build()
  assert.equal(desc.block, 'timeline')
  assert.deepEqual(desc.items[0], { title: 'Placed', time: '09:41', tone: 'success' })
  // nested builders in a body become plain descriptors
  assert.deepEqual(desc.items[1], { title: 'Note', body: [{ block: 'text', value: 'Hi' }] })
})

test('resolve defaults tone/filled/time and passes a string body through', () => {
  const r = resolvePage(definePage({ sections: [timeline().item('A', { body: 'plain' })] })).sections[0]
  assert.equal(r.block, 'timeline')
  assert.deepEqual(r.resolved.items[0], { title: 'A', time: null, tone: 'default', filled: true, blocks: false, body: 'plain' })
})

test('resolve turns a nested-block body into resolved view-models', () => {
  const item = resolvePage(definePage({ sections: [timeline().item('A', { filled: false, body: [text('Hi')] })] })).sections[0].resolved.items[0]
  assert.equal(item.filled, false)
  assert.equal(item.blocks, true)
  assert.equal(item.body[0].block, 'text')
  assert.deepEqual(item.body[0].resolved, { value: 'Hi' })
})

test('timelineDotColor maps tones, falling back to the primary', () => {
  assert.match(timelineDotColor('danger'), /--color-danger/)
  assert.match(timelineDotColor('nope'), /--color-primary/)
})
