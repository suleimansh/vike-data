// The popover BLOCK (as opposed to the popover primitive geometry in popover.test.js): a trigger + a
// floating panel of arbitrary nested content (registerBlock, type 'popover', builder `popover`) with
// variant / side / align + an optional custom trigger block. The renderers are not node:test-tested
// (JSX/Vue stateful + DOM-only popover primitive), so this covers the agnostic builder + resolve:
// content collapses recursively, the trigger block resolves, placement + variant clamp.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { popover, button, heading, text, definePage, resolvePage, hasBlock } from '../index.js'

test('popover is registered', () => {
  assert.ok(hasBlock('popover'))
})

test('the builder collapses content to descriptors with defaults', () => {
  const built = popover('Filters')
    .content([heading('Filter posts').level(4), text('Narrow the list.')])
    .build()
  assert.equal(built.block, 'popover')
  assert.equal(built.label, 'Filters')
  assert.equal(built.variant, 'outline') // default trigger variant
  assert.equal(built.side, 'bottom')
  assert.equal(built.align, 'start')
  assert.equal(built.trigger, undefined) // no custom trigger given
  assert.equal(built.content.length, 2)
  assert.equal(built.content[0].block, 'heading')
  assert.equal(built.content[1].block, 'text')
})

test('a custom trigger block collapses; variant/side/align clamp to known values', () => {
  const built = popover()
    .trigger(button('Open').variant('secondary'))
    .variant('danger') // aliases to destructive via variantKey
    .side('sideways') // unknown -> bottom
    .align('end')
    .build()
  assert.equal(built.label, undefined) // no label given
  assert.equal(built.trigger.block, 'button')
  assert.equal(built.trigger.label, 'Open')
  assert.equal(built.variant, 'destructive')
  assert.equal(built.side, 'bottom')
  assert.equal(built.align, 'end')
})

test('resolves the label, content sections, and placement (label defaults to "Open")', () => {
  const out = resolvePage(definePage({ sections: [popover().content([text('Hi')])] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'popover')
  assert.equal(r.label, 'Open')
  assert.equal(r.variant, 'outline')
  assert.equal(r.side, 'bottom')
  assert.equal(r.trigger, null)
  assert.equal(r.content.length, 1)
  assert.equal(r.content[0].block, 'text')
})

test('resolves a custom trigger block into a view-model', () => {
  const out = resolvePage(definePage({ sections: [popover().trigger(button('Menu')).content([text('body')])] }))
  const r = out.sections[0].resolved
  assert.equal(r.trigger.block, 'button')
  assert.equal(r.trigger.resolved.label, 'Menu')
})

test('a raw descriptor with no variant resolves to the outline default', () => {
  const out = resolvePage({ sections: [{ block: 'popover', label: 'Raw', content: [] }] })
  assert.equal(out.sections[0].resolved.variant, 'outline')
  assert.equal(out.sections[0].resolved.label, 'Raw')
})
