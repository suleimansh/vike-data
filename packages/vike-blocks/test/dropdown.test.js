// The dropdown block: a menu anchored below a trigger (registerBlock, type 'dropdown', accumulating
// builder `dropdown`) with item / separator / heading rows + align / side placement. The renderers are
// not node:test-tested (JSX/Vue stateful + DOM-only popover + roving focus), so this covers the
// agnostic builder + resolve and the shared placement helper. The roving-focus math (moveMenuFocus)
// walks the live DOM, so it's exercised live in the example, not here.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dropdown, definePage, resolvePage, hasBlock } from '../index.js'
import { dropdownPlacement } from '../dropdown-styles.js'

test('dropdown is registered', () => {
  assert.ok(hasBlock('dropdown'))
})

test('the builder accumulates items in order and collapses to a descriptor', () => {
  const built = dropdown('Options')
    .heading('Account')
    .item('Profile', { to: '/profile' })
    .item('Settings', { to: '/settings' })
    .separator()
    .item('Sign out')
    .build()
  assert.equal(built.block, 'dropdown')
  assert.equal(built.label, 'Options')
  assert.deepEqual(built.items, [
    { type: 'heading', label: 'Account' },
    { type: 'item', label: 'Profile', to: '/profile' },
    { type: 'item', label: 'Settings', to: '/settings' },
    { type: 'separator' },
    { type: 'item', label: 'Sign out' },
  ])
  assert.equal(built.align, 'start')
  assert.equal(built.side, 'bottom')
})

test('item options carry to + disabled; align/side clamp to known values', () => {
  const built = dropdown().item('Delete', { disabled: true }).align('end').side('top').build()
  assert.deepEqual(built.items[0], { type: 'item', label: 'Delete', disabled: true })
  assert.equal(built.label, undefined) // no trigger label given
  assert.equal(built.align, 'end')
  assert.equal(built.side, 'top')
  // unknown values fall back to the defaults
  assert.equal(dropdown().align('sideways').build().align, 'start')
  assert.equal(dropdown().side('left').build().side, 'bottom')
})

test('resolves the trigger label, item list, and placement (label defaults to "Menu")', () => {
  const out = resolvePage(definePage({ sections: [dropdown().item('Only')] }))
  assert.equal(out.sections[0].block, 'dropdown')
  assert.equal(out.sections[0].resolved.label, 'Menu')
  assert.equal(out.sections[0].resolved.items.length, 1)
  assert.equal(out.sections[0].resolved.align, 'start')
  const labeled = resolvePage(definePage({ sections: [dropdown('Actions').item('Go', { to: '/go' })] }))
  assert.equal(labeled.sections[0].resolved.label, 'Actions')
  assert.equal(labeled.sections[0].resolved.items[0].to, '/go')
})

test('dropdownPlacement composes a <side>-<align> string and clamps unknowns', () => {
  assert.equal(dropdownPlacement('bottom', 'start'), 'bottom-start')
  assert.equal(dropdownPlacement('top', 'end'), 'top-end')
  assert.equal(dropdownPlacement('nonsense', 'nonsense'), 'bottom-start')
  assert.equal(dropdownPlacement(), 'bottom-start')
})
