// The badge block: a leaf pill on the shadcn Base badge surface. `.variant()` picks the surface,
// `.tone()` is the historical semantic intent kept for back-compat (soft accent tint). The renderer
// is not node:test-tested (JSX/Vue), so this covers the agnostic builder + resolve plus the shared
// style module (variant/tone resolution) the two renderers share.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { badge, definePage, resolvePage, hasBlock } from '../index.js'
import { variantKey, toneKey, VARIANTS, TONES, badgeStyle } from '../blocks/badge-styles.js'

test('badge is registered', () => {
  assert.ok(hasBlock('badge'))
})

test('the builder collapses to a plain descriptor (variant + back-compat tone)', () => {
  assert.deepEqual(badge('Draft').build(), { block: 'badge', value: 'Draft' })
  assert.deepEqual(badge('New').variant('secondary').build(), { block: 'badge', value: 'New', variant: 'secondary' })
  assert.deepEqual(badge('Warn').tone('warning').build(), { block: 'badge', value: 'Warn', tone: 'warning' })
})

test('resolves as a pass-through section', () => {
  const out = resolvePage(definePage({ sections: [badge('Go').variant('destructive')] }))
  assert.equal(out.sections[0].block, 'badge')
  assert.deepEqual(out.sections[0].resolved, { value: 'Go', variant: 'destructive' })
})

test('the shadcn Base variant set is complete', () => {
  assert.deepEqual(Object.keys(VARIANTS).sort(), ['default', 'destructive', 'outline', 'secondary'])
})

test('variant/tone names normalize (unknown + aliases)', () => {
  assert.equal(variantKey('outline'), 'outline')
  assert.equal(variantKey('nope'), 'secondary') // unknown/unset -> neutral secondary
  assert.equal(variantKey(undefined), 'secondary')
  assert.equal(toneKey('warn'), 'warning') // alias
  assert.equal(toneKey('error'), 'danger')
  assert.equal(toneKey('nope'), 'muted') // unknown -> muted
})

test('badgeStyle: variant wins over tone, tone is a soft tint, bare is neutral', () => {
  // .variant() -> solid shadcn surface
  const solid = badgeStyle({ variant: 'destructive', tone: 'success' })
  assert.equal(solid.background, VARIANTS.destructive.bg) // variant takes precedence
  assert.equal(solid.color, VARIANTS.destructive.fg)

  // .tone() -> soft accent tint over the bg
  const soft = badgeStyle({ tone: 'success' })
  assert.equal(soft.color, TONES.success)
  assert.match(soft.background, /color-mix.*var\(--color-bg/)

  // bare -> neutral secondary surface
  const bare = badgeStyle({})
  assert.equal(bare.background, VARIANTS.secondary.bg)
})
