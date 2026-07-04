// The collapsible container block: a fluent builder for a single expand/collapse panel of nested
// blocks (the accordion's single-panel sibling), resolved recursively, with an initial open flag.
// Renderers (react/vue) are not node:test-tested (JSX/Vue); this covers the agnostic authoring + resolve.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { collapsible, heading, text, definePage, resolvePage, hasBlock } from '../index.js'

test('collapsible is registered', () => {
  assert.ok(hasBlock('collapsible'))
})

test('the builder collapses to a descriptor, with nested section builders collapsed too', () => {
  const desc = collapsible('Details', [heading('D').level(3), text('Fine print.')]).open().build()
  assert.equal(desc.block, 'collapsible')
  assert.equal(desc.label, 'Details')
  assert.equal(desc.open, true)
  assert.deepEqual(desc.sections, [{ block: 'heading', value: 'D', level: 3 }, { block: 'text', value: 'Fine print.' }])
})

test('omitting .open() leaves the descriptor closed (no open key)', () => {
  const desc = collapsible('Details', [text('x')]).build()
  assert.equal('open' in desc, false)
})

test('resolve fills the panel recursively; defaults to closed', () => {
  const out = resolvePage(definePage({ sections: [collapsible('More', [heading('First').level(2)])] }))
  const r = out.sections[0]
  assert.equal(r.block, 'collapsible')
  assert.equal(r.resolved.label, 'More')
  assert.equal(r.resolved.open, false)
  assert.equal(r.resolved.sections[0].block, 'heading')
  assert.deepEqual(r.resolved.sections[0].resolved, { value: 'First', level: 2 })
})

test('a plain descriptor (no builder) resolves too, honoring open', () => {
  const out = resolvePage(definePage({ sections: [{ block: 'collapsible', label: 'X', open: true, sections: [{ block: 'text', value: '1' }] }] }))
  assert.equal(out.sections[0].resolved.open, true)
  assert.deepEqual(out.sections[0].resolved.sections[0].resolved, { value: '1' })
})
