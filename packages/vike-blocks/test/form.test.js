// The form block: a non-schema form container (field/control blocks in a real <form>, native POST).
// The renderers are JSX/Vue (not node:test-tested), so this covers the agnostic builder, the
// recursive resolve of the nested fields, and the action/method/submit view-model.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { form, field, input, definePage, resolvePage, getBlock, hasBlock } from '../index.js'

const resolveForm = (builder) => getBlock('form').resolve({ props: builder.build() })

test('form is registered', () => {
  assert.ok(hasBlock('form'))
})

test('the builder collapses to a { block, ...props } descriptor', () => {
  const d = form({ action: '/members', method: 'post' }).fields([field('Name').control(input().name('name'))]).submit('Create').build()
  assert.equal(d.block, 'form')
  assert.equal(d.action, '/members')
  assert.equal(d.method, 'post')
  assert.equal(d.submitLabel, 'Create')
  assert.equal(d.fields.length, 1)
  assert.equal(d.fields[0].block, 'field')
})

test('action / method set via constructor or chainable setters', () => {
  assert.equal(resolveForm(form({ action: '/a' })).action, '/a')
  assert.equal(resolveForm(form().action('/b')).action, '/b')
  assert.equal(resolveForm(form().method('GET')).method, 'get') // normalized lowercase
})

test('method defaults to post; action defaults to null (an inert structural render)', () => {
  const out = resolveForm(form({ fields: [] }))
  assert.equal(out.method, 'post')
  assert.equal(out.action, null)
})

test('submit label defaults to Save; .submit() overrides; .submit(false) drops the button', () => {
  assert.equal(resolveForm(form()).submitLabel, 'Save')
  assert.equal(resolveForm(form().submit('Create member')).submitLabel, 'Create member')
  assert.equal(resolveForm(form().submit(false)).submitLabel, false)
})

test('fields resolve recursively — nested field + control become view-models', () => {
  const out = resolveForm(
    form({ action: '/x' }).fields([
      field('Email').description('We never share it.').control(input().type('email').name('email')),
      field('Bio').control(input().name('bio')),
    ]),
  )
  assert.equal(out.sections.length, 2)
  assert.equal(out.sections[0].block, 'field')
  assert.equal(out.sections[0].resolved.label, 'Email')
  assert.equal(out.sections[0].resolved.description, 'We never share it.')
  // the field's own control resolved one level deeper
  assert.equal(out.sections[0].resolved.control.block, 'input')
  assert.equal(out.sections[0].resolved.control.resolved.type, 'email')
})

test('fields accepts already-built descriptors as well as builders', () => {
  const out = resolveForm(form().fields([field('A').control(input().name('a')).build()]))
  assert.equal(out.sections.length, 1)
  assert.equal(out.sections[0].block, 'field')
})

test('resolves as a section through a page', () => {
  const out = resolvePage(definePage({ sections: [form({ action: '/go' }).fields([field('N').control(input().name('n'))]).submit('Go')] }))
  assert.equal(out.sections[0].block, 'form')
  assert.equal(out.sections[0].resolved.action, '/go')
  assert.equal(out.sections[0].resolved.submitLabel, 'Go')
  assert.equal(out.sections[0].resolved.sections.length, 1)
})
