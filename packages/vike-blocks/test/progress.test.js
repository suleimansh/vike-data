// The progress block: a dep-free, theme-native progress bar (pure-CSS fill + a keyframed indeterminate
// segment, no JS/state). The renderer is not node:test-tested (JSX/Vue), so this covers the agnostic
// builder + resolve (value -> clamped percent, max, indeterminate, label) + the pure clampPercent helper.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { progress, definePage, resolvePage, hasBlock } from '../index.js'
import { clampPercent } from '../progress-styles.js'

test('progress is registered', () => {
  assert.ok(hasBlock('progress'))
})

test('the builder collapses to a descriptor', () => {
  assert.deepEqual(progress(66).build(), { block: 'progress', value: 66, max: 100, size: 8 })
  assert.deepEqual(progress().value(3).max(5).label('Step 3 of 5').build(), { block: 'progress', value: 3, max: 5, size: 8, label: 'Step 3 of 5' })
  assert.deepEqual(progress().indeterminate().size(4).build(), { block: 'progress', max: 100, size: 4, indeterminate: true })
})

test('resolve computes a clamped percent from value/max', () => {
  const out = resolvePage(definePage({ sections: [progress().value(3).max(5)] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'progress')
  assert.equal(r.value, 3)
  assert.equal(r.max, 5)
  assert.equal(r.percent, 60)
  assert.equal(r.indeterminate, false)
})

test('resolve leaves percent null when indeterminate', () => {
  const out = resolvePage(definePage({ sections: [progress().indeterminate().label('Loading...')] }))
  const r = out.sections[0].resolved
  assert.equal(r.indeterminate, true)
  assert.equal(r.percent, null)
  assert.equal(r.label, 'Loading...')
})

test('clampPercent clamps out-of-range values and handles a custom max / bad max', () => {
  assert.equal(clampPercent(50, 100), 50)
  assert.equal(clampPercent(3, 5), 60)
  assert.equal(clampPercent(-10, 100), 0) // below zero
  assert.equal(clampPercent(200, 100), 100) // above max
  assert.equal(clampPercent(5, 0), 0) // non-positive max
})
