// The defineCrud authorization model (#581, #582) as vike-admin consumes it, exercised through the
// real data hooks over the memory adapter. Covers the five `canX` gates (index/create/view/edit/
// delete), the `onCreate` write stamp, and per-field `.when(ctx)` visibility — the surface that
// replaced the old `scope(user)` / `canView(user)` / `canEdit(user)` shape.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { setAdapter, clearAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'
import { defineResource, column, field } from '../define.js'
import { resolveAdminTables, buildDb } from '../resolve.js'
import { dashboardData, listData, newData, editData } from '../data.js'

const postsSchema = defineSchema('posts', (t) => {
  t.uuid('id').primary()
  t.uuid('user_id')
  t.string('title')
  t.string('status')
})

const USER = { id: 'u1', role: 'user' }
const ADMIN = { id: 'admin', role: 'admin' }

const listCtx = (config, user, routeParams = { table: 'posts' }) => ({ routeParams, config, user, urlParsed: { search: {} } })
function postCtx(config, form, routeParams, user) {
  const req = new Request('http://localhost/admin', {
    method: 'POST',
    body: new URLSearchParams(form).toString(),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  })
  return { routeParams, config, user, urlParsed: { search: {} }, _reqWeb: req }
}
const freshDb = (config) => buildDb(resolveAdminTables(config))

beforeEach(() => {
  clearAdapter()
  setAdapter(createMemoryAdapter())
})

test('canIndex: hides a resource from the dashboard and 302s the list for a denied user', async () => {
  const posts = defineResource({ table: 'posts', canIndex: (ctx) => ctx.user?.role === 'admin' })
  const config = { schemas: [postsSchema], adminResources: [posts] }

  assert.deepEqual((await dashboardData(listCtx(config, USER))).resources, [])
  assert.equal((await dashboardData(listCtx(config, ADMIN))).resources.length, 1)
  await assert.rejects(listData(listCtx(config, USER))) // redirect('/admin')
  assert.ok(await listData(listCtx(config, ADMIN)))
})

test('canCreate: gates the New button (list view-model) and the create hook', async () => {
  const posts = defineResource({ table: 'posts', canCreate: (ctx) => ctx.user?.role === 'admin' })
  const config = { schemas: [postsSchema], adminResources: [posts] }

  assert.equal((await listData(listCtx(config, USER))).canCreate, false)
  assert.equal((await listData(listCtx(config, ADMIN))).canCreate, true)
  await assert.rejects(newData(postCtx(config, { title: 'x' }, { table: 'posts' }, USER))) // denied -> redirect
  await assert.rejects(newData(postCtx(config, { title: 'x' }, { table: 'posts' }, ADMIN))) // allowed -> redirect on success
  assert.equal((await freshDb(config).posts.find({ title: 'x' })).length, 1) // only the admin's insert landed
})

test('canEdit(record, ctx): drives the per-row Edit link and gates the edit hook against the loaded row', async () => {
  // Only DRAFT posts are editable; a published post is locked.
  const posts = defineResource({ table: 'posts', canEdit: (post) => post.status === 'draft' })
  const config = { schemas: [postsSchema], adminResources: [posts] }
  await freshDb(config).posts.insert({ id: 'p-draft', user_id: 'u1', title: 'd', status: 'draft' })
  await freshDb(config).posts.insert({ id: 'p-pub', user_id: 'u1', title: 'p', status: 'published' })

  const list = await listData(listCtx(config, USER))
  assert.deepEqual(Object.fromEntries(list.rows.map((r) => [r.id, r._canEdit])), { 'p-draft': true, 'p-pub': false })

  assert.ok((await editData(listCtx(config, USER, { table: 'posts', id: 'p-draft' }))).values)
  await assert.rejects(editData(listCtx(config, USER, { table: 'posts', id: 'p-pub' }))) // locked -> redirect

  // a POST update to the locked row is a no-op
  await assert.rejects(editData(postCtx(config, { title: 'hacked' }, { table: 'posts', id: 'p-pub' }, USER)))
  assert.equal((await freshDb(config).posts.findOne({ id: 'p-pub' })).title, 'p')
})

test('canDelete(record, ctx): gates the delete path independently of edit', async () => {
  // Editable by anyone, but only an admin may delete.
  const posts = defineResource({ table: 'posts', canDelete: (post, ctx) => ctx.user?.role === 'admin' })
  const config = { schemas: [postsSchema], adminResources: [posts] }
  await freshDb(config).posts.insert({ id: 'p1', user_id: 'u1', title: 't', status: 'draft' })

  const list = await listData(listCtx(config, USER))
  assert.equal(list.rows[0]._canEdit, true) // no canEdit -> allowed
  assert.equal(list.rows[0]._canDelete, false) // canDelete denies the non-admin

  await assert.rejects(editData(postCtx(config, { _action: 'delete' }, { table: 'posts', id: 'p1' }, USER)))
  assert.ok(await freshDb(config).posts.findOne({ id: 'p1' }), 'the non-admin delete was a no-op')

  await assert.rejects(editData(postCtx(config, { _action: 'delete' }, { table: 'posts', id: 'p1' }, ADMIN)))
  assert.equal(await freshDb(config).posts.findOne({ id: 'p1' }), null, 'the admin delete removed it')
})

test('onCreate: forces the owner column onto an insert, overriding a forged value', async () => {
  const posts = defineResource({
    table: 'posts',
    form: [field('user_id'), field('title')],
    onCreate: (ctx) => ({ user_id: ctx.user.id }),
  })
  const config = { schemas: [postsSchema], adminResources: [posts] }

  await assert.rejects(newData(postCtx(config, { user_id: 'someone-else', title: 'mine' }, { table: 'posts' }, USER)))
  const row = (await freshDb(config).posts.find({ title: 'mine' }))[0]
  assert.equal(row.user_id, 'u1') // stamped to the creator, not the forged value
})

test('.when(ctx): a hidden field is dropped from the form AND not writable', async () => {
  const posts = defineResource({
    table: 'posts',
    form: [field('title'), field('status').when((ctx) => ctx.user?.role === 'admin')],
    onCreate: (ctx) => ({ user_id: ctx.user.id }),
  })
  const config = { schemas: [postsSchema], adminResources: [posts] }

  const asUser = await newData(listCtx(config, USER))
  assert.deepEqual(asUser.fields.map((f) => f.name), ['title']) // status hidden for a non-admin
  const asAdmin = await newData(listCtx(config, ADMIN))
  assert.deepEqual(asAdmin.fields.map((f) => f.name), ['title', 'status'])

  // a non-admin forging `status` in the body is ignored (the field isn't in the coercion set)
  await assert.rejects(newData(postCtx(config, { title: 't', status: 'forged' }, { table: 'posts' }, USER)))
  assert.notEqual((await freshDb(config).posts.find({ title: 't' }))[0].status, 'forged')
})

test('.when(ctx): a hidden LIST column never ships to the client', async () => {
  const posts = defineResource({
    table: 'posts',
    list: [column('title'), column('status').when((ctx) => ctx.user?.role === 'admin')],
  })
  const config = { schemas: [postsSchema], adminResources: [posts] }
  await freshDb(config).posts.insert({ id: 'p1', user_id: 'u1', title: 't', status: 'secret' })

  const asUser = await listData(listCtx(config, USER))
  assert.equal(asUser.columns.some((c) => c.name === 'status'), false)
  assert.equal('status' in asUser.rows[0], false) // the value is gone too, not just the column

  const asAdmin = await listData(listCtx(config, ADMIN))
  assert.equal(asAdmin.rows[0].status, 'secret')
})
