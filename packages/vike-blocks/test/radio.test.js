// The radio block: a dep-free, theme-native radio GROUP built with a fluent accumulating builder
// (radioGroup().option(...).value(...)). The renderer is not node:test-tested (JSX/Vue stateful), so
// this covers the agnostic builder + the resolve (options + the initial selection) plus the shared
// style module (circle border, dot spring, the states style tag).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { radioGroup, field, definePage, resolvePage, hasBlock } from '../index.js'
import { radioCircleStyle, radioDotStyle, RADIO_STYLE_TAG } from '../radio-styles.js'

test('radio is registered', () => {
  assert.ok(hasBlock('radio'))
})

test('the builder accumulates options and collapses to a descriptor', () => {
  assert.deepEqual(radioGroup().option('free', 'Free').option('pro', 'Pro').value('pro').build(), {
    block: 'radio',
    options: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro' },
    ],
    value: 'pro',
  })
  // label defaults to the value; name + disabled flow through
  assert.deepEqual(radioGroup().option('a').name('plan').disabled().build(), {
    block: 'radio',
    options: [{ value: 'a', label: 'a' }],
    name: 'plan',
    disabled: true,
  })
})

test('resolve defaults the selection to the first option when unset', () => {
  const out = resolvePage(definePage({ sections: [radioGroup().option('x', 'X').option('y', 'Y')] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'radio')
  assert.equal(r.value, 'x') // first option
  assert.equal(r.options.length, 2)
  assert.equal(r.disabled, false)
})

test('resolve keeps a declared selection', () => {
  const out = resolvePage(definePage({ sections: [radioGroup().option('x', 'X').option('y', 'Y').value('y')] }))
  assert.equal(out.sections[0].resolved.value, 'y')
})

test('an empty group resolves to a null selection (no crash)', () => {
  const out = resolvePage(definePage({ sections: [radioGroup()] }))
  assert.equal(out.sections[0].resolved.value, null)
  assert.deepEqual(out.sections[0].resolved.options, [])
})

test('composes as a field control', () => {
  const out = resolvePage(definePage({ sections: [field('Plan').control(radioGroup().option('free', 'Free').value('free'))] }))
  assert.equal(out.sections[0].resolved.control.block, 'radio')
  assert.equal(out.sections[0].resolved.control.resolved.value, 'free')
})

test('radio styles: the circle borders + dot spring only when selected', () => {
  assert.match(radioCircleStyle(true).border, /var\(--color-primary/)
  assert.match(radioCircleStyle(false).border, /var\(--color-border/)
  assert.equal(radioDotStyle(true).transform, 'scale(1)')
  assert.equal(radioDotStyle(false).opacity, 0)
  assert.match(RADIO_STYLE_TAG, /:focus-visible\{[^}]*box-shadow/)
})
