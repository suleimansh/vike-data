// The field block: a form-field CONTAINER (label + control slot + description + error) wrapping a
// single control block. The renderer is not node:test-tested (JSX/Vue), so this covers the agnostic
// builder + the recursive resolve (the control resolves to a nested view-model), using existing
// blocks (text / button) as the wrapped control — a field is control-agnostic.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { field, text, button, definePage, resolvePage, hasBlock } from '../index.js'

test('field is registered', () => {
  assert.ok(hasBlock('field'))
})

test('the builder collapses to a descriptor, collapsing a builder control', () => {
  assert.deepEqual(field('Email').control(text('you@example.com')).build(), {
    block: 'field',
    label: 'Email',
    control: { block: 'text', value: 'you@example.com' },
  })
  assert.deepEqual(field('Password').description('At least 8 chars').error('Too short').control(button('x')).build(), {
    block: 'field',
    label: 'Password',
    description: 'At least 8 chars',
    error: 'Too short',
    control: { block: 'button', label: 'x' },
  })
})

test('a field with no control builds without one', () => {
  assert.deepEqual(field('Bare').build(), { block: 'field', label: 'Bare' })
})

test('resolve recursively resolves the control into a nested view-model', () => {
  const out = resolvePage(definePage({ sections: [field('Email').description('Shown once').control(text('a@b.co').tone('muted'))] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'field')
  assert.equal(r.label, 'Email')
  assert.equal(r.description, 'Shown once')
  assert.equal(r.error, null)
  // the nested control is a fully resolved section
  assert.equal(r.control.block, 'text')
  assert.deepEqual(r.control.resolved, { value: 'a@b.co', tone: 'muted' })
})

test('resolve tolerates a missing control (control -> null)', () => {
  const out = resolvePage(definePage({ sections: [field('Label only')] }))
  assert.equal(out.sections[0].resolved.control, null)
  assert.equal(out.sections[0].resolved.label, 'Label only')
})

test('an unknown control block still errors clearly through the field', () => {
  assert.throws(
    () => resolvePage({ sections: [{ block: 'field', label: 'x', control: { block: 'nope' } }] }),
    /unknown block "nope"/,
  )
})
