// The tag-input block: a tag / chip multi-select token field (registerBlock, type 'tag-input', builder
// `tagInput`). The renderer is not node:test-tested (JSX/Vue stateful + keyboard/DOM), so this covers
// the agnostic builder + resolve (initial tags + suggestions coerced to strings, placeholder / name /
// max defaults) and the pure `filterSuggestions` helper the renderers share.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tagInput, definePage, resolvePage, hasBlock } from '../index.js'
import { filterSuggestions } from '../blocks/tag-input-styles.js'

test('tag-input is registered', () => {
  assert.ok(hasBlock('tag-input'))
})

test('the builder collapses to a descriptor; absent parts omitted', () => {
  const built = tagInput().value(['react', 'vue']).suggestions(['react', 'svelte']).placeholder('Add...').name('frameworks').max(5).build()
  assert.equal(built.block, 'tag-input')
  assert.deepEqual(built.value, ['react', 'vue'])
  assert.deepEqual(built.suggestions, ['react', 'svelte'])
  assert.equal(built.placeholder, 'Add...')
  assert.equal(built.name, 'frameworks')
  assert.equal(built.max, 5)
  const bare = tagInput().build()
  assert.deepEqual(bare.value, [])
  assert.equal(bare.suggestions, undefined)
  assert.equal(bare.name, undefined)
})

test('resolve coerces tags + suggestions to strings and fills defaults', () => {
  const out = resolvePage(definePage({ sections: [tagInput().value([1, 'two']).suggestions(['a', 3])] }))
  const r = out.sections[0].resolved
  assert.deepEqual(r.value, ['1', 'two'])
  assert.deepEqual(r.suggestions, ['a', '3'])
  assert.equal(r.placeholder, 'Add a tag...') // default
  assert.equal(r.name, null)
  assert.equal(r.max, null)
  assert.equal(r.disabled, false)
})

test('resolve drops a non-positive / non-number max to null', () => {
  assert.equal(resolvePage(definePage({ sections: [tagInput().max(0)] })).sections[0].resolved.max, null)
  assert.equal(resolvePage(definePage({ sections: [tagInput().max(3)] })).sections[0].resolved.max, 3)
})

test('filterSuggestions drops already-selected and non-matching options', () => {
  const pool = ['react', 'vue', 'svelte', 'solid']
  // empty query -> all unselected
  assert.deepEqual(filterSuggestions(pool, ['react'], ''), ['vue', 'svelte', 'solid'])
  // query filters by substring (case-insensitive), still excluding selected
  assert.deepEqual(filterSuggestions(pool, ['vue'], 's'), ['svelte', 'solid'])
  assert.deepEqual(filterSuggestions(pool, [], 'RE'), ['react'])
  assert.deepEqual(filterSuggestions(pool, ['react', 'vue', 'svelte', 'solid'], ''), [])
})
