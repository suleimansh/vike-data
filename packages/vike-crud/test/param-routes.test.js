// #577 — param routes + load-by-id + the update/delete write path. defineCrud in route mode emits
// /posts, /posts/new, /posts/@id, /posts/@id/edit; the generic data layer resolves which view a
// pathname is (static routes beating @param), loads one owner-scoped row for the view/edit screens,
// pre-fills the edit form, and the write path keys update/delete on the primary key AND the scope.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { setAdapter, clearAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'
import { defineResource, resourcePages, resolveViewTables, buildDb, hydrateView, updateRow, deleteRow } from '../index.js'
import { resolveViewRequest, matchRoute, viewPages } from '../react/pages.js'

const rp = () => resourcePages(defineResource({ table: 'posts', mode: 'route' }))

const posts = defineSchema('posts', (t) => {
  t.uuid('id').primary()
  t.string('title')
  t.uuid('user_id') // owner
  t.timestamps()
})
const config = { schemas: [posts] }
const tables = () => resolveViewTables(config)
const form = (obj) => ({ get: (k) => (k in obj ? obj[k] : null), has: (k) => k in obj })
const scope = (_t, ctx) => ({ user_id: ctx.user.id }) // owner contract
const u1 = { user: { id: 'u1' } }
const hydrate = (view, id) => hydrateView(view, { tables: tables(), db, scope, ctx: u1, id })

let db
beforeEach(async () => {
  clearAdapter()
  setAdapter(createMemoryAdapter())
  db = buildDb(tables())
  await db.posts.insert({ id: 'p1', title: 'Alice', user_id: 'u1' })
  await db.posts.insert({ id: 'p2', title: 'Bob', user_id: 'u2' })
})

test('matchRoute captures @params and rejects mismatched shapes', () => {
  assert.deepEqual(matchRoute('/posts/@id', '/posts/123'), { id: '123' })
  assert.deepEqual(matchRoute('/posts', '/posts'), {})
  assert.equal(matchRoute('/posts/@id', '/posts'), null)
  assert.equal(matchRoute('/posts/new', '/posts/123'), null)
  assert.deepEqual(matchRoute('/posts/@id/edit', '/posts/p1/edit'), { id: 'p1' })
})

test('resolveViewRequest resolves each screen; static routes win over @param', () => {
  const views = rp()
  assert.equal(resolveViewRequest(views, '/posts').view.crud.screen, 'index')
  assert.equal(resolveViewRequest(views, '/posts/new').view.crud.screen, 'create')
  const view = resolveViewRequest(views, '/posts/p1')
  assert.equal(view.view.crud.screen, 'view')
  assert.deepEqual(view.params, { id: 'p1' })
  assert.equal(resolveViewRequest(views, '/posts/p1/edit').view.crud.screen, 'edit')
  assert.equal(resolveViewRequest(views, '/nope'), null)
})

test('viewPages emits the @id param route (Vike route string) for the generated pages', () => {
  const pages = viewPages(rp())
  assert.ok(pages.some((p) => p.route === '/posts/@id'))
  assert.ok(pages.every((p) => p.data && p.Page))
})

test('view screen loads one owner-scoped row by route id', async () => {
  const view = resolveViewRequest(rp(), '/posts/p1').view
  const out = await hydrate(view, 'p1')
  assert.equal(out.sections.find((s) => s.block === 'record').resolved.row.title, 'Alice')
})

test('a non-owned id does not leak (record row is null)', async () => {
  const view = resolveViewRequest(rp(), '/posts/p2').view
  const out = await hydrate(view, 'p2') // p2 is bob's; current user is u1
  assert.equal(out.sections.find((s) => s.block === 'record').resolved.row, null)
})

test('edit screen pre-fills the owned row; blank (null) for another owner', async () => {
  const editView = resolveViewRequest(rp(), '/posts/p1/edit').view
  const owned = await hydrate(editView, 'p1')
  assert.equal(owned.sections.find((s) => s.block === 'form').resolved.values.title, 'Alice')
  const notOwned = await hydrate(editView, 'p2')
  assert.equal(notOwned.sections.find((s) => s.block === 'form').resolved.values, null)
})

test('create screen form is blank (no id)', async () => {
  const createView = resolveViewRequest(rp(), '/posts/new').view
  const out = await hydrate(createView, null)
  assert.deepEqual(out.sections.find((s) => s.block === 'form').resolved.values, {})
})

test('update persists and reflects on reload; another owner cannot update', async () => {
  const t = tables()
  const fields = [{ name: 'title' }]
  await updateRow(db, t, 'posts', fields, 'p1', form({ title: 'Alice edited' }), { scope, ctx: u1 })
  assert.equal((await db.posts.findOne({ id: 'p1' })).title, 'Alice edited')
  // u1 attempts to edit p2 (bob's) -> the scoped update matches nothing
  await updateRow(db, t, 'posts', fields, 'p2', form({ title: 'hacked' }), { scope, ctx: u1 })
  assert.equal((await db.posts.findOne({ id: 'p2' })).title, 'Bob')
})

test('delete keys on id AND scope; another owner cannot delete', async () => {
  const t = tables()
  await deleteRow(db, t, 'posts', 'p2', { scope, ctx: u1 }) // p2 is bob's
  assert.ok(await db.posts.findOne({ id: 'p2' }), 'bob’s row survives u1’s delete')
  await deleteRow(db, t, 'posts', 'p1', { scope, ctx: u1 })
  assert.equal(await db.posts.findOne({ id: 'p1' }), null)
})
