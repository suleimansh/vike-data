// The skeleton block: a dep-free, theme-native pulsing placeholder (pure-CSS pulse, no JS/state). The
// renderer is not node:test-tested (JSX/Vue), so this covers the agnostic builder + resolve (dimension
// defaults, circle shorthand, line count) + the CSS length/radius helpers + the style tag.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { skeleton, definePage, resolvePage, hasBlock } from '../index.js'
import { cssLen, cssRadius, SKELETON_STYLE_TAG } from '../skeleton-styles.js'

test('skeleton is registered', () => {
  assert.ok(hasBlock('skeleton'))
})

test('the builder collapses to a descriptor; circle() is a full-radius square', () => {
  assert.deepEqual(skeleton().width('60%').height('1.5rem').build(), { block: 'skeleton', width: '60%', height: '1.5rem' })
  assert.deepEqual(skeleton().circle(40).build(), { block: 'skeleton', width: 40, height: 40, radius: 'full' })
  assert.deepEqual(skeleton().lines(3).build(), { block: 'skeleton', lines: 3 })
})

test('resolve applies the dimension + line defaults', () => {
  const out = resolvePage(definePage({ sections: [skeleton()] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'skeleton')
  assert.equal(r.width, '100%')
  assert.equal(r.height, '1rem')
  assert.equal(r.radius, null) // renderer falls back to the theme radius
  assert.equal(r.lines, 1)
})

test('resolve keeps declared dimensions + circle radius + lines', () => {
  const out = resolvePage(definePage({ sections: [skeleton().circle(48)] }))
  assert.deepEqual(
    { w: out.sections[0].resolved.width, h: out.sections[0].resolved.height, r: out.sections[0].resolved.radius },
    { w: 48, h: 48, r: 'full' },
  )
  assert.equal(resolvePage(definePage({ sections: [skeleton().lines(4)] })).sections[0].resolved.lines, 4)
})

test('cssLen: numbers -> px, strings pass through; cssRadius: full -> pill', () => {
  assert.equal(cssLen(40), '40px')
  assert.equal(cssLen('100%'), '100%')
  assert.equal(cssLen('1rem'), '1rem')
  assert.equal(cssRadius('full'), '999px')
  assert.equal(cssRadius(8), '8px')
  assert.equal(cssRadius('var(--radius, 6px)'), 'var(--radius, 6px)')
})

test('the style tag defines the pulse keyframes and respects reduced motion', () => {
  assert.match(SKELETON_STYLE_TAG, /@keyframes vike-blocks-pulse/)
  assert.match(SKELETON_STYLE_TAG, /prefers-reduced-motion: reduce/)
})
