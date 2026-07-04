// The spinner block: a dep-free, theme-native loading ring (pure-CSS spin, no JS/state). The renderer
// is not node:test-tested (JSX/Vue), so this covers the agnostic builder + resolve (size default, the
// size-scaled thickness, tone default) + the tone->color map + the style tag.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spinner, definePage, resolvePage, hasBlock } from '../index.js'
import { spinnerColor, SPINNER_STYLE_TAG } from '../blocks/spinner-styles.js'

test('spinner is registered', () => {
  assert.ok(hasBlock('spinner'))
})

test('the builder collapses to a descriptor with a default size', () => {
  assert.deepEqual(spinner().build(), { block: 'spinner', size: 20 })
  assert.deepEqual(spinner().size(32).tone('danger').label('Loading').build(), { block: 'spinner', size: 32, tone: 'danger', label: 'Loading' })
})

test('resolve derives a thickness scaled to the size and defaults the tone', () => {
  const r = resolvePage(definePage({ sections: [spinner()] })).sections[0]
  assert.equal(r.block, 'spinner')
  assert.deepEqual(r.resolved, { size: 20, thickness: 2, tone: 'default', label: null })
  assert.equal(resolvePage(definePage({ sections: [spinner().size(40)] })).sections[0].resolved.thickness, 4) // round(40/10)
  assert.equal(resolvePage(definePage({ sections: [spinner().size(10)] })).sections[0].resolved.thickness, 2) // floored at 2
})

test('spinnerColor maps tones, falling back to the primary', () => {
  assert.match(spinnerColor('success'), /--color-success/)
  assert.match(spinnerColor('nope'), /--color-primary/)
})

test('the style tag defines the spin keyframes and respects reduced motion', () => {
  assert.match(SPINNER_STYLE_TAG, /@keyframes vike-blocks-spin/)
  assert.match(SPINNER_STYLE_TAG, /prefers-reduced-motion: reduce/)
})
