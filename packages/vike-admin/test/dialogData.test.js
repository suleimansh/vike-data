// Dialog mode (#596): a `mode: 'dialog'` resource hosts view/create/edit as an overlay on the LIST
// route, so listData hydrates the active dialog (read from `?view=/?edit=/?create`) alongside the
// list. Exercised without Vike/React over the memory adapter, the same way listData.test.js is. Pins:
// the `mode` in the view-model, the per-screen dialog payload, the record-level gates, precedence,
// and that route-mode resources compute no dialog.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { setAdapter, clearAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'
import { defineResource, column } from '../define.js'
import { resolveAdminTables, buildDb } from '../resolve.js'
import { listData } from '../data.js'

const usersSchema = defineSchema('users', (t) => {
  t.uuid('id').primary()
  t.string('email')
  t.string('name').nullable()
})

// A dialog-mode resource, and a route-mode (default) one, over the same table.
const dialogResource = defineResource({ table: 'users', mode: 'dialog', index: [column('email')] })
const routeResource = defineResource({ table: 'users', index: [column('email')] })
// A dialog resource that forbids viewing a row, to pin the record-level gate.
const noViewResource = defineResource({ table: 'users', mode: 'dialog', index: [column('email')], canView: () => false })

const configWith = (resource) => ({ schemas: [usersSchema], adminResources: [resource] })
const pc = (config, search = {}) => ({ routeParams: { table: 'users' }, config, user: { role: 'admin' }, urlParsed: { search } })

async function seed(config) {
  const db = buildDb(resolveAdminTables(config))
  await db.users.insert({ id: 'u1', email: 'a@b.com', name: 'Ann' })
  await db.users.insert({ id: 'u2', email: 'c@d.com', name: 'Cyd' })
}

beforeEach(() => {
  clearAdapter()
  setAdapter(createMemoryAdapter())
})

test('route mode: mode is "route" and no dialog is hydrated, even with a ?view param', async () => {
  const config = configWith(routeResource)
  await seed(config)
  const data = await listData(pc(config, { view: 'u1' }))
  assert.equal(data.mode, 'route')
  assert.equal(data.dialog, null)
})

test('dialog mode with no dialog param: mode is "dialog", dialog is null', async () => {
  const config = configWith(dialogResource)
  await seed(config)
  const data = await listData(pc(config))
  assert.equal(data.mode, 'dialog')
  assert.equal(data.dialog, null)
})

test('?view=id hydrates the record dialog with the row values + gates', async () => {
  const config = configWith(dialogResource)
  await seed(config)
  const { dialog } = await listData(pc(config, { view: 'u1' }))
  assert.equal(dialog.screen, 'view')
  assert.equal(dialog.id, 'u1')
  assert.equal(dialog.values.email, 'a@b.com')
  assert.equal(dialog.canEdit, true) // no canEdit gate -> allowed
  assert.equal(dialog.canDelete, true)
  assert.ok(dialog.fields.some((f) => f.name === 'email'))
})

test('?edit=id hydrates the edit form dialog pre-filled with the row', async () => {
  const config = configWith(dialogResource)
  await seed(config)
  const { dialog } = await listData(pc(config, { edit: 'u2' }))
  assert.equal(dialog.screen, 'edit')
  assert.equal(dialog.id, 'u2')
  assert.equal(dialog.values.email, 'c@d.com')
  assert.ok(dialog.fields.some((f) => f.name === 'email'))
})

test('?create hydrates an empty create form dialog (no values)', async () => {
  const config = configWith(dialogResource)
  await seed(config)
  const { dialog } = await listData(pc(config, { create: '' }))
  assert.equal(dialog.screen, 'create')
  assert.equal(dialog.values, undefined)
  assert.ok(dialog.fields.some((f) => f.name === 'email'))
})

test('a canView-denied row opens no dialog (a stale ?view param renders nothing)', async () => {
  const config = configWith(noViewResource)
  await seed(config)
  const { dialog } = await listData(pc(config, { view: 'u1' }))
  assert.equal(dialog, null)
})

test('an unknown id opens no dialog', async () => {
  const config = configWith(dialogResource)
  await seed(config)
  const { dialog } = await listData(pc(config, { view: 'nope' }))
  assert.equal(dialog, null)
})

test('precedence: view wins over edit and create when several params are set', async () => {
  const config = configWith(dialogResource)
  await seed(config)
  const { dialog } = await listData(pc(config, { view: 'u1', edit: 'u2', create: '' }))
  assert.equal(dialog.screen, 'view')
  assert.equal(dialog.id, 'u1')
})
