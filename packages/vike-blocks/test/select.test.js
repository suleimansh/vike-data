// The select block: a dep-free, theme-native single-choice control over a native <select>, built with
// a fluent accumulating builder (select().option(...).value(...).placeholder(...)). The renderer is not
// node:test-tested (JSX/Vue stateful), so this covers the agnostic builder + the resolve (options + the
// initial selection, which for a select is NOT forced to the first option) plus the shared style module.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { select, field, definePage, resolvePage, hasBlock } from '../index.js'
import { selectStyle, selectChevronStyle, SELECT_STYLE_TAG } from '../blocks/select-styles.js'

test('select is registered', () => {
  assert.ok(hasBlock('select'))
})

test('the builder accumulates options and collapses to a descriptor', () => {
  assert.deepEqual(select().option('free', 'Free').option('pro', 'Pro').value('pro').build(), {
    block: 'select',
    options: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro' },
    ],
    value: 'pro',
  })
  // label defaults to the value; placeholder + name + disabled flow through; per-option disabled too
  assert.deepEqual(select().placeholder('Pick one').option('a').option('b', 'B', { disabled: true }).name('plan').disabled().build(), {
    block: 'select',
    options: [
      { value: 'a', label: 'a' },
      { value: 'b', label: 'B', disabled: true },
    ],
    placeholder: 'Pick one',
    name: 'plan',
    disabled: true,
  })
})

test('resolve does NOT force the first option (a select can start empty)', () => {
  const out = resolvePage(definePage({ sections: [select().placeholder('Pick').option('x', 'X').option('y', 'Y')] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'select')
  assert.equal(r.value, null) // unset, so the placeholder shows
  assert.equal(r.placeholder, 'Pick')
  assert.equal(r.options.length, 2)
  assert.equal(r.disabled, false)
})

test('resolve keeps a declared selection', () => {
  const out = resolvePage(definePage({ sections: [select().option('x', 'X').option('y', 'Y').value('y')] }))
  assert.equal(out.sections[0].resolved.value, 'y')
})

test('.required() flows through the builder + resolve (for a forced pick / native validation)', () => {
  assert.deepEqual(select().option('a').required().build(), {
    block: 'select',
    options: [{ value: 'a', label: 'a' }],
    required: true,
  })
  const out = resolvePage(definePage({ sections: [select().placeholder('Pick').option('a', 'A').required()] }))
  assert.equal(out.sections[0].resolved.required, true)
  // a select without .required() resolves required:false (placeholder stays selectable = clearable)
  const opt = resolvePage(definePage({ sections: [select().placeholder('Pick').option('a', 'A')] }))
  assert.equal(opt.sections[0].resolved.required, false)
})

test('an empty select resolves to a null selection (no crash)', () => {
  const out = resolvePage(definePage({ sections: [select()] }))
  assert.equal(out.sections[0].resolved.value, null)
  assert.deepEqual(out.sections[0].resolved.options, [])
})

test('composes as a field control', () => {
  const out = resolvePage(definePage({ sections: [field('Plan').control(select().option('free', 'Free').value('free'))] }))
  assert.equal(out.sections[0].resolved.control.block, 'select')
  assert.equal(out.sections[0].resolved.control.resolved.value, 'free')
})

test('select styles: theme-native box + chevron + the states style tag', () => {
  assert.match(selectStyle(false).border, /var\(--color-border/)
  assert.equal(selectStyle(false).appearance, 'none') // native arrow stripped
  assert.match(selectChevronStyle().color, /var\(--color-muted/)
  assert.match(SELECT_STYLE_TAG, /vike-blocks-select:focus-visible/)
  assert.match(SELECT_STYLE_TAG, /data-placeholder=true/) // unquoted: Vue escapes " inside <style>, breaking the selector
})
