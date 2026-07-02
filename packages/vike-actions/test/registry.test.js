import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineAction, registerAction, getAction, hasAction, listActions, clearActions } from '../index.js'

beforeEach(() => clearActions())

test('defineAction registers and returns a serializable reference (no run/guard leaked)', () => {
  const ref = defineAction('publish', { confirm: 'Publish?', onSuccess: 'reload', run: async () => ({ ok: true }) })
  assert.deepEqual(ref, { name: 'publish', confirm: 'Publish?', onSuccess: 'reload' })
  assert.equal(typeof ref.run, 'undefined')
  assert.ok(hasAction('publish'))
  assert.deepEqual(listActions(), ['publish'])
})

test('getAction returns the stored def with defaults filled', () => {
  defineAction('del', { run: async () => null })
  const a = getAction('del')
  assert.equal(a.name, 'del')
  assert.equal(a.guard, null)
  assert.equal(a.input, null)
  assert.equal(a.confirm, null)
  assert.equal(typeof a.run, 'function')
})

test('a later definition overrides an earlier one', () => {
  defineAction('x', { run: async () => 1 })
  defineAction('x', { run: async () => 2 })
  assert.equal(listActions().length, 1)
})

test('run is required; bad name/def/guard throw at registration', () => {
  assert.throws(() => registerAction('', { run: async () => {} }), /non-empty string name/)
  assert.throws(() => registerAction('a', {}), /def.run must be a function/)
  assert.throws(() => registerAction('a', { run: async () => {}, guard: 5 }), /def.guard must be/)
  assert.throws(() => registerAction('a', { run: async () => {}, input: 'nope' }), /def.input must be/)
})

test('getAction/hasAction on an unknown name are null/false', () => {
  assert.equal(getAction('nope'), null)
  assert.equal(hasAction('nope'), false)
})
