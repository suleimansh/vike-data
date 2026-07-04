// defineResource speaks the defineCrud SCREEN vocabulary (index / view / edit), translating onto
// the block keys vike-crud's resolve reads (list / record / form). `create` aliases `edit` (admin
// renders a single form). The old block keys are NOT a second authoring surface — they don't pass
// through. Exercised through the resolve derivation over the memory adapter.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { setAdapter, clearAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'
import { defineResource, column, display, field } from '../define.js'
import { resolveAdminTables, viewColumns, viewRecord, viewFields, resourceMode } from '../resolve.js'

const usersSchema = defineSchema('users', (t) => {
  t.uuid('id').primary()
  t.string('email')
  t.string('name').nullable()
})
const config = { schemas: [usersSchema], adminResources: [] }
const table = () => resolveAdminTables(config)[0]

beforeEach(() => {
  clearAdapter()
  setAdapter(createMemoryAdapter())
})

test('index -> the list columns', () => {
  const r = defineResource({ table: 'users', index: [column('email')] })
  assert.deepEqual(viewColumns(r, table()).map((c) => c.name), ['email'])
})

test('view -> the record (detail) fields', () => {
  const r = defineResource({ table: 'users', view: [display('email'), display('name')] })
  assert.deepEqual(viewRecord(r, table()).map((f) => f.name), ['email', 'name'])
})

test('edit -> the form fields', () => {
  const r = defineResource({ table: 'users', edit: [field('email').required()] })
  const fields = viewFields(r, table())
  assert.deepEqual(fields.map((f) => f.name), ['email'])
  assert.equal(fields[0].required, true)
})

test('create is an alias for edit (admin renders one form)', () => {
  const r = defineResource({ table: 'users', create: [field('name')] })
  assert.deepEqual(viewFields(r, table()).map((f) => f.name), ['name'])
})

test('edit wins over create when both are given', () => {
  const r = defineResource({ table: 'users', edit: [field('email')], create: [field('name')] })
  assert.deepEqual(viewFields(r, table()).map((f) => f.name), ['email'])
})

test('the old block keys (list/record/form) are NOT a second surface — ignored, not passed through', () => {
  // Passing `list` no longer refines the columns; the resource derives every column from the schema.
  const r = defineResource({ table: 'users', list: [column('email')] })
  assert.deepEqual(viewColumns(r, table()).map((c) => c.name), ['email', 'name']) // schema-derived, not just email
})

test('mode passes through and resourceMode reads it; default is route (#596)', () => {
  assert.equal(resourceMode(defineResource({ table: 'users' })), 'route') // absent -> route
  assert.equal(resourceMode(defineResource({ table: 'users', mode: 'route' })), 'route')
  assert.equal(resourceMode(defineResource({ table: 'users', mode: 'dialog' })), 'dialog')
})

test('an invalid mode is a clear authoring error, not a silently-ignored key (#596)', () => {
  assert.throws(() => defineResource({ table: 'users', mode: 'dailog' }), /mode.*must be 'route' or 'dialog'/)
  assert.throws(() => defineResource({ table: 'users', mode: 'inline' }), /mode.*must be 'route' or 'dialog'/)
})

test('label / recordTitle / auth keys pass through untouched', () => {
  const query = (q, ctx) => q.where('id', ctx.user.id)
  const r = defineResource({ table: 'users', label: 'People', recordTitle: 'email', query, canIndex: () => true })
  assert.equal(r.label, 'People')
  assert.equal(r.recordTitle, 'email')
  assert.equal(r.query, query)
  assert.equal(typeof r.canIndex, 'function')
})
