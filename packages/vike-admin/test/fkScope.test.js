// FK option scoping (#141, #676): a foreign-key <select> (and the list's FK label map) must not
// enumerate the WHOLE referenced table for a scoped, non-admin user — that crosses the same
// row-scope boundary the rest of the module enforces and serializes the target rows (often
// emails / names) into the page view-model. FK enrichment mirrors the user's LIST access to the
// target: only a registered resource the user may `canIndex` is read, bounded by its own
// `scope(user)`. An unregistered / index-gated target yields no options and no labels (#676).
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { setAdapter, clearAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'
import { defineResource } from '../define.js'
import { resolveAdminTables, buildDb } from '../resolve.js'
import { listData, newData, editData } from '../data.js'

const usersSchema = defineSchema('users', (t) => {
  t.uuid('id').primary()
  t.string('email')
})

const projectsSchema = defineSchema('projects', (t) => {
  t.uuid('id').primary()
  t.uuid('owner_id').references('users.id')
  t.string('name')
})

// users is the FK TARGET and is itself scoped: a non-admin sees only their own user row.
const users = defineResource({
  table: 'users',
  recordTitle: 'email',
  query: (q, ctx) => (ctx.user?.role === 'admin' ? q : q.where('id', ctx.user.id)),
})
// projects is unscoped, so a non-admin can open its create/edit form and hit the FK lookup.
const projects = defineResource({ table: 'projects' })
const config = { schemas: [usersSchema, projectsSchema], adminResources: [users, projects] }

const USER = { id: 'u1', role: 'user' }
const ADMIN = { id: 'admin', role: 'admin' }

const ctx = (user, routeParams = { table: 'projects' }, search = {}) => ({ routeParams, config, user, urlParsed: { search } })
const freshDb = () => buildDb(resolveAdminTables(config))

async function seed() {
  const db = freshDb()
  await db.users.insert({ id: 'u1', email: 'u1@example.com' })
  await db.users.insert({ id: 'u2', email: 'u2@example.com' })
  await db.users.insert({ id: 'admin', email: 'admin@example.com' })
  await db.projects.insert({ id: 'p1', owner_id: 'u1', name: 'mine' })
  await db.projects.insert({ id: 'p2', owner_id: 'u2', name: 'theirs' })
}

const ownerOptions = (data) => data.fields.find((f) => f.name === 'owner_id').options.map((o) => o.value).sort()

beforeEach(() => {
  clearAdapter()
  setAdapter(createMemoryAdapter())
})

test('create form: a scoped user only sees in-scope rows in the FK dropdown', async () => {
  await seed()
  const data = await newData(ctx(USER))
  assert.deepEqual(ownerOptions(data), ['u1']) // only their own user row, not u2/admin
})

test('create form: an admin (scope null) sees every row in the FK dropdown', async () => {
  await seed()
  const data = await newData(ctx(ADMIN))
  assert.deepEqual(ownerOptions(data), ['admin', 'u1', 'u2'])
})

test('edit form: the FK dropdown is bounded by the target scope too', async () => {
  await seed()
  const data = await editData(ctx(USER, { table: 'projects', id: 'p1' }))
  assert.deepEqual(ownerOptions(data), ['u1'])
})

test('list: the FK label map only includes in-scope target rows (no email leak)', async () => {
  await seed()
  const scoped = await listData(ctx(USER))
  // u1 is the user's own row -> labelled; u2 is out of scope -> absent (cell falls back to raw key).
  assert.deepEqual(scoped.fkLabels.owner_id, { u1: 'u1@example.com' })
  assert.equal(scoped.fkLabels.owner_id.u2, undefined)

  const asAdmin = await listData(ctx(ADMIN))
  assert.equal(asAdmin.fkLabels.owner_id.u2, 'u2@example.com') // admin sees all labels
})

test('list: the FK label map only carries REFERENCED target rows, not every in-scope row (#676)', async () => {
  await seed()
  // admin@example.com references no project, so its email must not ride along in the map even
  // though the admin may see it. Only the two owners actually shown (u1, u2) get a label.
  const asAdmin = await listData(ctx(ADMIN))
  assert.deepEqual(asAdmin.fkLabels.owner_id, { u1: 'u1@example.com', u2: 'u2@example.com' })
  assert.equal(asAdmin.fkLabels.owner_id.admin, undefined)
})

test('an FK to a table with NO registered resource yields no options and no labels (#676)', async () => {
  // Drop the users resource: the FK target is now an un-registered table. It must NOT enumerate.
  const cfg = { schemas: [usersSchema, projectsSchema], adminResources: [projects] }
  clearAdapter()
  setAdapter(createMemoryAdapter())
  const db = buildDb(resolveAdminTables(cfg))
  await db.users.insert({ id: 'u1', email: 'u1@example.com' })
  await db.users.insert({ id: 'u2', email: 'u2@example.com' })
  await db.projects.insert({ id: 'p1', owner_id: 'u1', name: 'mine' })
  const pc = (routeParams = { table: 'projects' }) => ({ routeParams, config: cfg, user: USER, urlParsed: { search: {} } })
  const created = await newData(pc())
  assert.deepEqual(created.fields.find((f) => f.name === 'owner_id').options, []) // no email dump
  const listed = await listData(pc())
  assert.deepEqual(listed.fkLabels.owner_id, {}) // no email leak in the list either
})

test('an FK target the user may not canIndex yields no options / labels (#676)', async () => {
  // users is registered but index-gated to admins; a non-admin editing projects must not enumerate.
  const gatedUsers = defineResource({ table: 'users', recordTitle: 'email', canIndex: (c) => c.user?.role === 'admin' })
  const cfg = { schemas: [usersSchema, projectsSchema], adminResources: [gatedUsers, projects] }
  clearAdapter()
  setAdapter(createMemoryAdapter())
  const db = buildDb(resolveAdminTables(cfg))
  await db.users.insert({ id: 'u1', email: 'u1@example.com' })
  await db.users.insert({ id: 'u2', email: 'u2@example.com' })
  await db.projects.insert({ id: 'p1', owner_id: 'u1', name: 'mine' })
  const pc = (user) => ({ routeParams: { table: 'projects' }, config: cfg, user, urlParsed: { search: {} } })
  const asUser = await newData(pc(USER))
  assert.deepEqual(asUser.fields.find((f) => f.name === 'owner_id').options, []) // denied: no dump
  assert.deepEqual((await listData(pc(USER))).fkLabels.owner_id, {})
  const asAdmin = await newData(pc(ADMIN))
  assert.deepEqual(asAdmin.fields.find((f) => f.name === 'owner_id').options.map((o) => o.value).sort(), ['u1', 'u2'])
})
