// #581 — authorization end-to-end on the memory adapter: the `query` read scope filters rows, the
// `.when` field gate keeps hidden columns (and their data) off the wire, `onCreate` stamps writes,
// and the generic data hook enforces the `can*` gate (deny -> the write is refused).
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { setAdapter, clearAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'
import { defineCrud, display, field, resolveViewTables, buildDb, hydrateView, createRow, queryScope } from '../index.js'
import { resolveViewRequest } from '../react/pages.js'
import { viewData } from '../react/viewData.js'

const posts = defineSchema('posts', (t) => {
  t.uuid('id').primary()
  t.string('title')
  t.string('secret').nullable()
  t.uuid('user_id')
  t.timestamps()
})
const config = (views) => ({ schemas: [posts], views })
const tables = () => resolveViewTables({ schemas: [posts] })
const admin = { id: 'a1', role: 'admin' }
const user = { id: 'u1', role: 'user' }

let db
beforeEach(async () => {
  clearAdapter()
  setAdapter(createMemoryAdapter())
  db = buildDb(tables())
  await db.posts.insert({ id: 'p1', title: 'Alice', secret: 's1', user_id: 'u1' })
  await db.posts.insert({ id: 'p2', title: 'Bob', secret: 's2', user_id: 'u2' })
})

// --- query read scope (admin sees all, others see their own) ---
test('query scope filters list rows; admin bypass returns all', async () => {
  const views = defineCrud('posts', { mode: 'route', query: (q, c) => (c.user.role === 'admin' ? q : q.where('user_id', c.user.id)) })
  const view = resolveViewRequest(views, '/posts').view
  const scope = queryScope(view.crud.query)

  const asUser = await hydrateView(view, { tables: tables(), db, scope, ctx: { user }, search: {} })
  const rows = asUser.sections.find((s) => s.block === 'list').resolved.rows
  assert.deepEqual(rows.map((r) => r.title), ['Alice']) // only u1's row

  const asAdmin = await hydrateView(view, { tables: tables(), db, scope, ctx: { user: admin }, search: {} })
  assert.equal(asAdmin.sections.find((s) => s.block === 'list').resolved.rows.length, 2)
})

// --- .when field visibility (data never ships) ---
test('.when hides a field AND its data server-side', async () => {
  const views = defineCrud('posts', { mode: 'route', view: [display('title'), display('secret').when((c) => c.user.role === 'admin')] })
  const view = resolveViewRequest(views, '/posts/p1').view

  const asUser = await hydrateView(view, { tables: tables(), db, ctx: { user }, id: 'p1' })
  const recU = asUser.sections.find((s) => s.block === 'record').resolved
  assert.ok(!recU.fields.some((f) => f.name === 'secret'), 'secret field dropped for non-admin')
  assert.equal('secret' in recU.row, false, 'secret VALUE never projected into the row')

  const asAdmin = await hydrateView(view, { tables: tables(), db, ctx: { user: admin }, id: 'p1' })
  const recA = asAdmin.sections.find((s) => s.block === 'record').resolved
  assert.ok(recA.fields.some((f) => f.name === 'secret'))
  assert.equal(recA.row.secret, 's1')
})

// --- onCreate write stamp ---
test('onCreate forces the owner column, overriding a forged value', async () => {
  await createRow(db, tables(), 'posts', [{ name: 'title' }, { name: 'user_id' }], form({ title: 'New', user_id: 'forged' }), {
    ctx: { user },
    onCreate: (c) => ({ user_id: c.user.id }),
  })
  const created = await db.posts.findOne({ title: 'New' })
  assert.equal(created.user_id, 'u1') // stamped, not 'forged'
})

// --- can* gate enforced by the data hook ---
test('canView denies the detail GET (throws); allows when the predicate passes', async () => {
  const denied = defineCrud('posts', { mode: 'route', canView: () => false })
  await assert.rejects(viewData(pc({ pathname: '/posts/p1', user, views: denied })))

  const allowed = defineCrud('posts', { mode: 'route', canView: () => true })
  const out = await viewData(pc({ pathname: '/posts/p1', user, views: allowed }))
  assert.equal(out.sections.find((s) => s.block === 'record').resolved.row.title, 'Alice')
})

test('canCreate denies the create POST — no row is written', async () => {
  const before = await db.posts.count({})
  const views = defineCrud('posts', { mode: 'route', canCreate: () => false })
  await assert.rejects(viewData(pc({ pathname: '/posts/new', user, views, method: 'POST', body: { title: 'Blocked' } })))
  assert.equal(await db.posts.count({}), before) // nothing inserted
})

test('a .when-hidden field is not writable via a forged POST', async () => {
  // secret is admin-only; u1 forging it on edit must not persist
  const views = defineCrud('posts', { mode: 'route', edit: [field('title'), field('secret').when((c) => c.user.role === 'admin')] })
  await assert.rejects(viewData(pc({ pathname: '/posts/p1/edit', user, views, method: 'POST', body: { title: 'Edited', secret: 'HACK' } })))
  const row = await db.posts.findOne({ id: 'p1' })
  assert.equal(row.title, 'Edited') // visible field written
  assert.equal(row.secret, 's1') // hidden field NOT written despite being in the body
})

// A FormData-shaped stand-in for the write path (get/has).
function form(obj) {
  return { get: (k) => (k in obj ? obj[k] : null), has: (k) => k in obj }
}

// A minimal Vike pageContext for the data hook. POST bodies ride on a Web Request (_reqWeb), the
// same surface readFormRequest reads on a server adapter.
function pc({ pathname, user, views, method = 'GET', body }) {
  const context = { config: config(views), urlPathname: pathname, urlParsed: { search: {} }, user }
  if (method === 'POST') context._reqWeb = new Request('http://x' + pathname, { method: 'POST', body: new URLSearchParams(body) })
  return context
}
