// The checkbox block: a dep-free, theme-native boolean control leaf (defineBlock) with label /
// checked / disabled / name refinements and an animated check. The renderer is not node:test-tested
// (JSX/Vue stateful), so this covers the agnostic builder + resolve plus the shared style module
// (box fill, check spring, the states style tag).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkbox, field, definePage, resolvePage, hasBlock } from '../index.js'
import { checkboxBoxStyle, checkStyle, CHECKBOX_STYLE_TAG } from '../checkbox-styles.js'

test('checkbox is registered', () => {
  assert.ok(hasBlock('checkbox'))
})

test('the builder collapses to a plain descriptor (label optional)', () => {
  assert.deepEqual(checkbox('Accept the terms').build(), { block: 'checkbox', label: 'Accept the terms' })
  assert.deepEqual(checkbox('Subscribe').checked().build(), { block: 'checkbox', label: 'Subscribe', checked: true })
  assert.deepEqual(checkbox('Locked').checked().disabled().name('agree').build(), {
    block: 'checkbox',
    label: 'Locked',
    checked: true,
    disabled: true,
    name: 'agree',
  })
  assert.deepEqual(checkbox().build(), { block: 'checkbox' }) // no label
})

test('resolves as a pass-through section', () => {
  const out = resolvePage(definePage({ sections: [checkbox('Remember me').checked()] }))
  assert.equal(out.sections[0].block, 'checkbox')
  assert.deepEqual(out.sections[0].resolved, { label: 'Remember me', checked: true })
})

test('composes as a field control', () => {
  const out = resolvePage(definePage({ sections: [field('Consent').control(checkbox('I agree'))] }))
  assert.equal(out.sections[0].resolved.control.block, 'checkbox')
  assert.deepEqual(out.sections[0].resolved.control.resolved, { label: 'I agree' })
})

test('checkboxBoxStyle fills with the primary color only when checked', () => {
  assert.match(checkboxBoxStyle(true).background, /var\(--color-primary/)
  assert.match(checkboxBoxStyle(false).background, /var\(--color-bg/)
})

test('checkStyle springs the check in on check and hides it when unchecked', () => {
  assert.equal(checkStyle(true).opacity, 1)
  assert.equal(checkStyle(true).transform, 'scale(1)')
  assert.equal(checkStyle(false).opacity, 0)
})

test('the states style tag covers focus-visible and disabled', () => {
  assert.match(CHECKBOX_STYLE_TAG, /:focus-visible\{[^}]*box-shadow/)
  assert.match(CHECKBOX_STYLE_TAG, /:disabled\{opacity:\.5\}/)
})
