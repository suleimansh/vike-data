// The combobox block: a dep-free, theme-native searchable single-select on the popover primitive, built
// with a fluent accumulating builder (combobox().option(...).value(...).placeholder(...)). The renderer
// is not node:test-tested (JSX/Vue stateful), so this covers the agnostic builder + the resolve (options
// + defaulted labels) + the shared, pure filterOptions helper both renderers use.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { combobox, field, definePage, resolvePage, hasBlock } from '../index.js'
import { filterOptions, comboboxItemStyle, COMBOBOX_STYLE_TAG } from '../combobox-styles.js'

test('combobox is registered', () => {
  assert.ok(hasBlock('combobox'))
})

test('the builder accumulates options and collapses to a descriptor', () => {
  assert.deepEqual(combobox().option('ada', 'Ada').option('alan', 'Alan').value('ada').build(), {
    block: 'combobox',
    options: [
      { value: 'ada', label: 'Ada' },
      { value: 'alan', label: 'Alan' },
    ],
    value: 'ada',
  })
  // label defaults to the value; the text labels + name + disabled flow through
  assert.deepEqual(combobox().option('a').placeholder('Assign').searchPlaceholder('Find').empty('None').name('owner').disabled().build(), {
    block: 'combobox',
    options: [{ value: 'a', label: 'a' }],
    placeholder: 'Assign',
    searchPlaceholder: 'Find',
    empty: 'None',
    name: 'owner',
    disabled: true,
  })
})

test('resolve defaults the placeholder / search / empty labels and starts unselected', () => {
  const out = resolvePage(definePage({ sections: [combobox().option('x', 'X').option('y', 'Y')] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'combobox')
  assert.equal(r.value, null)
  assert.equal(r.placeholder, 'Select...')
  assert.equal(r.searchPlaceholder, 'Search...')
  assert.equal(r.empty, 'No results.')
  assert.equal(r.options.length, 2)
})

test('resolve keeps a declared selection + custom labels', () => {
  const out = resolvePage(definePage({ sections: [combobox().option('x', 'X').value('x').placeholder('Pick a thing')] }))
  assert.equal(out.sections[0].resolved.value, 'x')
  assert.equal(out.sections[0].resolved.placeholder, 'Pick a thing')
})

test('composes as a field control', () => {
  const out = resolvePage(definePage({ sections: [field('Owner').control(combobox().option('ada', 'Ada').value('ada'))] }))
  assert.equal(out.sections[0].resolved.control.block, 'combobox')
  assert.equal(out.sections[0].resolved.control.resolved.value, 'ada')
})

test('filterOptions matches label OR value, case-insensitively; empty query returns all', () => {
  const options = [
    { value: 'ada', label: 'Ada Lovelace' },
    { value: 'alan', label: 'Alan Turing' },
    { value: 'grace', label: 'Grace Hopper' },
  ]
  assert.equal(filterOptions(options, '').length, 3)
  assert.equal(filterOptions(options, '   ').length, 3)
  assert.deepEqual(filterOptions(options, 'turing').map((o) => o.value), ['alan'])
  assert.deepEqual(filterOptions(options, 'AL').map((o) => o.value), ['alan']) // matches "Alan" label; not "ada"
  assert.deepEqual(filterOptions(options, 'grace').map((o) => o.value), ['grace'])
  assert.equal(filterOptions(options, 'zzz').length, 0)
})

test('combobox styles: the active + selected rows read theme vars; the states style tag', () => {
  assert.match(comboboxItemStyle(true, false).background, /var\(--color-surface/) // active highlight
  assert.equal(comboboxItemStyle(false, true).fontWeight, 600) // selected weight
  assert.match(COMBOBOX_STYLE_TAG, /vike-blocks-combobox-trigger:focus-visible/)
})
