// The context-menu block: a fluent builder for a right-click menu (dropdown item model) that wraps a
// region via .on(). Renderers (react/vue) are DOM-only (portal + cursor positioning + roving focus) and
// are not node:test-tested; this covers the agnostic authoring + resolve + the pure cursor-placement math.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contextMenu, card, text, definePage, resolvePage, hasBlock } from '../index.js'
import { clampMenuPosition } from '../blocks/context-menu-styles.js'

test('context-menu is registered', () => {
  assert.ok(hasBlock('context-menu'))
})

test('the builder accumulates items in order (item / separator / heading) and collapses the region', () => {
  const desc = contextMenu()
    .heading('Actions')
    .item('Open', { to: '/file/1' })
    .item('Delete', { disabled: true })
    .separator()
    .item('Rename')
    .on(card([text('Right-click')]))
    .build()
  assert.equal(desc.block, 'context-menu')
  assert.deepEqual(desc.items, [
    { type: 'heading', label: 'Actions' },
    { type: 'item', label: 'Open', to: '/file/1' },
    { type: 'item', label: 'Delete', disabled: true },
    { type: 'separator' },
    { type: 'item', label: 'Rename' },
  ])
  // .on() collapses a builder to a plain descriptor
  assert.equal(desc.trigger.block, 'card')
})

test('omitting .on() leaves no trigger key', () => {
  const desc = contextMenu().item('X').build()
  assert.equal('trigger' in desc, false)
})

test('resolve passes the items through and recursively resolves the region block', () => {
  const out = resolvePage(definePage({ sections: [contextMenu().item('Open', { to: '/x' }).on(card([text('Hi')]))] }))
  const r = out.sections[0].resolved
  assert.deepEqual(r.items, [{ type: 'item', label: 'Open', to: '/x' }])
  assert.equal(r.trigger.block, 'card')
  assert.equal(r.trigger.resolved.sections[0].block, 'text')
})

test('resolve yields a null trigger when no region is wrapped', () => {
  const r = resolvePage(definePage({ sections: [contextMenu().item('X')] })).sections[0].resolved
  assert.equal(r.trigger, null)
})

// ---- cursor placement -----------------------------------------------------------------------------

const viewport = { width: 1000, height: 800 }
const menu = { width: 200, height: 300 }

test('clampMenuPosition opens down-right from the cursor when there is room', () => {
  assert.deepEqual(clampMenuPosition({ x: 100, y: 100 }, menu, viewport), { left: 100, top: 100 })
})

test('it flips to the LEFT of the cursor when the menu would overflow the right edge', () => {
  const { left } = clampMenuPosition({ x: 950, y: 100 }, menu, viewport)
  assert.equal(left, 750) // 950 - 200
})

test('it flips ABOVE the cursor when the menu would overflow the bottom edge', () => {
  const { top } = clampMenuPosition({ x: 100, y: 780 }, menu, viewport)
  assert.equal(top, 480) // 780 - 300
})

test('it clamps to the margin so it never clips even if the cursor is in a corner', () => {
  const { left, top } = clampMenuPosition({ x: 5, y: 5 }, menu, viewport, 8)
  assert.equal(left, 8)
  assert.equal(top, 8)
})

test('a menu taller than the viewport is pinned to the top margin, not pushed off-screen', () => {
  const tall = { width: 200, height: 900 }
  const { top } = clampMenuPosition({ x: 100, y: 400 }, tall, viewport, 8)
  assert.equal(top, 8)
})
