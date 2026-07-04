// viewData — the /admin/:table/:id read-only detail hook (#590) — exercised over the memory
// adapter. Pins: it loads the owned row and returns the resolved RECORD fields + values, gates the
// row with canView(record, ctx), enriches FK values with their target-row label, drops `.when`-
// hidden fields, and carries canEdit/canDelete for the page's action controls.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { setAdapter, clearAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'
import { defineResource, display } from '../define.js'
import { resolveAdminTables, buildDb } from '../resolve.js'
import { viewData } from '../data.js'

const usersSchema = defineSchema('users', (t) => {
  t.uuid('id').primary()
  t.string('email')
})
const postsSchema = defineSchema('posts', (t) => {
  t.uuid('id').primary()
  t.uuid('user_id')
  t.uuid('author_id').references('users.id')
  t.string('title')
  t.string('secret_notes')
})

const USER = { id: 'u1', role: 'user' }
const ADMIN = { id: 'admin', role: 'admin' }
const ctx = (user, id) => ({ routeParams: { table: 'posts', id }, config, user })

let config
const freshDb = () => buildDb(resolveAdminTables(config))

function build(resourceExtra = {}) {
  const posts = defineResource({ table: 'posts', recordTitle: 'title', ...resourceExtra })
  const users = defineResource({ table: 'users', recordTitle: 'email' })
  config = { schemas: [usersSchema, postsSchema], adminResources: [posts, users] }
}

beforeEach(async () => {
  clearAdapter()
  setAdapter(createMemoryAdapter())
})

async function seed() {
  const db = freshDb()
  await db.users.insert({ id: 'u1', email: 'u1@example.com' })
  await db.posts.insert({ id: 'p1', user_id: 'u1', author_id: 'u1', title: 'Mine', secret_notes: 'shh' })
  await db.posts.insert({ id: 'p2', user_id: 'u2', author_id: 'u1', title: 'Theirs', secret_notes: 'shh' })
}

test('loads the owned row and returns record fields + values + pk', async () => {
  build({ query: (q, c) => (c.user.role === 'admin' ? q : q.where('user_id', c.user.id)) })
  await seed()
  const data = await viewData(ctx(USER, 'p1'))
  assert.equal(data.table, 'posts')
  assert.equal(data.values.title, 'Mine')
  assert.equal(data.id, 'p1')
  assert.equal(data.pk, 'id')
  assert.ok(data.fields.some((f) => f.name === 'title'))
})

test('a row outside the query scope bounces to the list (redirect)', async () => {
  build({ query: (q, c) => (c.user.role === 'admin' ? q : q.where('user_id', c.user.id)) })
  await seed()
  await assert.rejects(viewData(ctx(USER, 'p2'))) // u2's post -> redirect
  assert.ok((await viewData(ctx(ADMIN, 'p2'))).values) // admin sees it
})

test('canView(record, ctx) gates the detail; a denied row redirects', async () => {
  build({ canView: (post) => post.title !== 'Theirs' })
  await seed()
  assert.ok((await viewData(ctx(ADMIN, 'p1'))).values)
  await assert.rejects(viewData(ctx(ADMIN, 'p2'))) // canView denies -> redirect
})

test('an unknown id redirects to the list', async () => {
  build()
  await seed()
  await assert.rejects(viewData(ctx(ADMIN, 'nope')))
})

test('a `.when`-hidden record field is dropped (value never leaves the server)', async () => {
  build({ record: [display('title'), display('secret_notes').when((c) => c.user.role === 'admin')] })
  await seed()
  const asUser = await viewData(ctx(USER, 'p1'))
  assert.equal(asUser.fields.some((f) => f.name === 'secret_notes'), false)
  assert.equal('secret_notes' in asUser.values, false)
  const asAdmin = await viewData(ctx(ADMIN, 'p1'))
  assert.equal(asAdmin.values.secret_notes, 'shh')
})

test('a foreign-key value is labelled from the target row', async () => {
  build()
  await seed()
  const data = await viewData(ctx(ADMIN, 'p1'))
  assert.equal(data.values.author_id, 'u1')
  assert.equal(data.values.author_id_label, 'u1@example.com') // resolved via users.recordTitle
})

test('canEdit / canDelete ride along for the page action controls', async () => {
  build({ canEdit: () => true, canDelete: (post, c) => c.user.role === 'admin' })
  await seed()
  const asUser = await viewData(ctx(USER, 'p1'))
  assert.equal(asUser.canEdit, true)
  assert.equal(asUser.canDelete, false)
  const asAdmin = await viewData(ctx(ADMIN, 'p1'))
  assert.equal(asAdmin.canDelete, true)
})
