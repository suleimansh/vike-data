// #578 — URL-synced dialogs (the server half). On a dialog-mode index page the URL decides which
// overlay is open: `?view=<id>` / `?edit=<id>` / `?create`. The data hook hydrates ONLY that
// screen's folded section (the others stay blank), so refreshing `/posts?view=p1` server-renders the
// list with the record dialog populated — shareable, and the client host just reflects the URL.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { setAdapter, clearAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'
import { defineResource, resourcePages, resolveViewTables, buildDb } from '../index.js'
import { activeDialog } from '../react/pages.js'
import { viewData } from '../react/viewData.js'

const rp = (opts = {}) => resourcePages(defineResource({ table: 'posts', ...opts }))

const posts = defineSchema('posts', (t) => {
  t.uuid('id').primary()
  t.string('title')
  t.uuid('user_id')
  t.timestamps()
})
const tables = () => resolveViewTables({ schemas: [posts] })
const user = { id: 'u1' }

let db
beforeEach(async () => {
  clearAdapter()
  setAdapter(createMemoryAdapter())
  db = buildDb(tables())
  await db.posts.insert({ id: 'p1', title: 'Alice', user_id: 'u1' })
  await db.posts.insert({ id: 'p2', title: 'Bob', user_id: 'u2' })
})

const pc = (pathname, search = {}) => ({ config: { schemas: [posts], resources: rp({ mode: 'dialog' }) }, urlPathname: pathname, urlParsed: { search }, user })
const bySection = (out, block, screen) => out.sections.find((s) => s.block === block && s.props.screen === screen)

test('activeDialog reads the open dialog from the query (view > edit > create)', () => {
  assert.deepEqual(activeDialog({ view: 'p1' }), { screen: 'view', id: 'p1' })
  assert.deepEqual(activeDialog({ edit: 'p1' }), { screen: 'edit', id: 'p1' })
  assert.deepEqual(activeDialog({ create: '' }), { screen: 'create', id: null })
  assert.deepEqual(activeDialog({ view: 'a', edit: 'b' }), { screen: 'view', id: 'a' }) // view wins
  assert.equal(activeDialog({}), null)
})

test("mode: 'dialog' is one index page (list + folded view/create/edit)", () => {
  const out = rp({ mode: 'dialog' })
  assert.equal(out.length, 1)
  assert.deepEqual(out[0].sections.map((s) => [s.block, s.screen, s.present]), [
    ['list', 'index', 'route'],
    ['record', 'view', 'dialog'],
    ['form', 'create', 'dialog'],
    ['form', 'edit', 'dialog'],
  ])
})

test('?view=p1 hydrates ONLY the record dialog; list + other dialogs stay blank', async () => {
  const out = await viewData(pc('/posts', { view: 'p1' }))
  assert.equal(bySection(out, 'record', 'view').resolved.row.title, 'Alice')
  assert.equal(bySection(out, 'form', 'create').resolved.values.title, undefined) // blank create form
  assert.deepEqual(bySection(out, 'form', 'edit').resolved.values, {}) // edit form NOT loaded
  assert.ok(out.sections.find((s) => s.block === 'list').resolved.rows.length >= 1) // list still renders
})

test('?edit=p1 hydrates ONLY the edit dialog', async () => {
  const out = await viewData(pc('/posts', { edit: 'p1' }))
  assert.equal(bySection(out, 'form', 'edit').resolved.values.title, 'Alice')
  assert.equal(bySection(out, 'record', 'view').resolved.row, null) // record NOT loaded
})

test('no query -> every dialog section is blank (all closed)', async () => {
  const out = await viewData(pc('/posts'))
  assert.equal(bySection(out, 'record', 'view').resolved.row, null)
  assert.deepEqual(bySection(out, 'form', 'edit').resolved.values, {})
  assert.deepEqual(bySection(out, 'form', 'create').resolved.values, {})
})
