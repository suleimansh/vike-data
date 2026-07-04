// The toggle-button + toggle-group blocks: a pressable on/off button and a segmented control
// (registerBlock, types 'toggle-button' / 'toggle-group', builders `toggleButton` / `toggleGroup`).
// Distinct from the switch (whose builder is `toggle`). The renderers are not node:test-tested (JSX/Vue
// stateful), so this covers the agnostic builders + resolve: the pressed/selection normalization to an
// array so the renderer treats single/multiple uniformly, and the placement + defaults.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toggleButton, toggleGroup, definePage, resolvePage, hasBlock } from '../index.js'
import { groupPosition } from '../blocks/toggle-styles.js'

test('both blocks are registered', () => {
  assert.ok(hasBlock('toggle-button'))
  assert.ok(hasBlock('toggle-group'))
})

test('toggleButton builds + resolves; pressed / disabled carry', () => {
  const built = toggleButton('Bold').pressed().disabled().build()
  assert.equal(built.block, 'toggle-button')
  assert.equal(built.label, 'Bold')
  assert.equal(built.pressed, true)
  assert.equal(built.disabled, true)
  const out = resolvePage(definePage({ sections: [toggleButton('Italic')] }))
  const r = out.sections[0].resolved
  assert.equal(r.label, 'Italic')
  assert.equal(r.pressed, false) // default off
  assert.equal(r.disabled, false)
  // .pressed(false) can turn it off explicitly
  assert.equal(toggleButton('X').pressed(false).build().pressed, undefined)
})

test('toggleGroup accumulates items in order and defaults to single-select', () => {
  const built = toggleGroup().item('list', 'List').item('grid', 'Grid').value('list').build()
  assert.equal(built.block, 'toggle-group')
  assert.deepEqual(built.items, [
    { value: 'list', label: 'List' },
    { value: 'grid', label: 'Grid' },
  ])
  assert.equal(built.value, 'list')
  assert.equal(built.multiple, undefined) // single by default
})

test('single-select resolves value to a one-element array (only the first if an array is given)', () => {
  const out = resolvePage(definePage({ sections: [toggleGroup().item('a', 'A').item('b', 'B').value('b')] }))
  const r = out.sections[0].resolved
  assert.equal(r.multiple, false)
  assert.deepEqual(r.value, ['b'])
  // an array value in single mode keeps only the first
  const one = resolvePage(definePage({ sections: [toggleGroup().item('a').item('b').value(['a', 'b'])] }))
  assert.deepEqual(one.sections[0].resolved.value, ['a'])
})

test('multiple-select keeps the full array; a bare value becomes a one-element array', () => {
  const many = resolvePage(definePage({ sections: [toggleGroup().item('b', 'B').item('i', 'I').multiple().value(['b', 'i'])] }))
  const r = many.sections[0].resolved
  assert.equal(r.multiple, true)
  assert.deepEqual(r.value, ['b', 'i'])
  // no value declared -> empty selection
  const none = resolvePage(definePage({ sections: [toggleGroup().item('b').multiple()] }))
  assert.deepEqual(none.sections[0].resolved.value, [])
})

test('groupPosition classifies ends and middle', () => {
  assert.equal(groupPosition(0, 1), 'only')
  assert.equal(groupPosition(0, 3), 'first')
  assert.equal(groupPosition(1, 3), 'middle')
  assert.equal(groupPosition(2, 3), 'last')
})
