// The tooltip block: a dep-free, theme-native tip revealed on hover / focus, pure-CSS (no JS/state).
// The renderer is not node:test-tested (JSX/Vue), so this covers the agnostic builder + resolve
// (text, placement clamp, the recursively-resolved wrapped trigger block) + the shared style tag.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tooltip, button, definePage, resolvePage, hasBlock } from '../index.js'
import { TOOLTIP_STYLE_TAG } from '../blocks/tooltip-styles.js'

test('tooltip is registered', () => {
  assert.ok(hasBlock('tooltip'))
})

test('the builder collapses to a descriptor, wrapping a trigger block', () => {
  assert.deepEqual(tooltip('Save your changes').side('bottom').on(button('Save')).build(), {
    block: 'tooltip',
    text: 'Save your changes',
    side: 'bottom',
    trigger: { block: 'button', label: 'Save' },
  })
})

test('side defaults to top and clamps an unknown value; no trigger is allowed', () => {
  assert.deepEqual(tooltip('Hi').build(), { block: 'tooltip', text: 'Hi', side: 'top' })
  assert.equal(tooltip('x').side('sideways').build().side, 'top')
})

test('resolve recursively resolves the wrapped trigger block', () => {
  const out = resolvePage(definePage({ sections: [tooltip('Delete permanently').side('right').on(button('Delete').variant('danger'))] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'tooltip')
  assert.equal(r.text, 'Delete permanently')
  assert.equal(r.side, 'right')
  assert.equal(r.trigger.block, 'button') // the trigger is resolved, not a raw builder
  assert.equal(r.trigger.resolved.label, 'Delete')
})

test('resolve with no trigger yields null (renderer draws the default marker)', () => {
  const out = resolvePage(definePage({ sections: [tooltip('We never share it')] }))
  assert.equal(out.sections[0].resolved.trigger, null)
})

test('the style tag reveals on hover + focus-within and positions by data-side', () => {
  assert.match(TOOLTIP_STYLE_TAG, /:hover .vike-blocks-tooltip-tip/)
  assert.match(TOOLTIP_STYLE_TAG, /:focus-within .vike-blocks-tooltip-tip/)
  assert.match(TOOLTIP_STYLE_TAG, /\[data-side=bottom\]/) // unquoted: Vue escapes " inside <style>, breaking the selector
})
