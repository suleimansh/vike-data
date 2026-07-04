// defineCrud(table, opts?) — the pure resource expander. It turns a table + intent into the set of
// definePage()s a CRUD resource needs, choosing per-screen presentation. These tests exercise the
// expansion only (no schema, no rendering): the output is plain definePage objects whose sections
// are serializable block descriptors tagged with `present` + `screen`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { defineCrud, crud, column, field, display } from '../index.js'

const blocks = (page) => page.sections.map((s) => s.block)
const presents = (page) => page.sections.map((s) => s.present)
const screens = (page) => page.sections.map((s) => s.screen)
const pageAt = (pages, route) => pages.find((p) => p.route === route)

test('default: one index page with view/create/edit folded as dialogs (no empty stacked record)', () => {
  const pages = defineCrud('posts')
  assert.equal(pages.length, 1)
  const index = pages[0]
  assert.equal(index.route, '/posts')
  assert.deepEqual(blocks(index), ['list', 'record', 'form', 'form'])
  assert.deepEqual(screens(index), ['index', 'view', 'create', 'edit'])
  // the list is the page itself (route); the rest only appear when their dialog is triggered
  assert.deepEqual(presents(index), ['route', 'dialog', 'dialog', 'dialog'])
})

test("mode: 'route' expands to four separate pages at the REST routes", () => {
  const pages = defineCrud('posts', { mode: 'route' })
  assert.deepEqual(
    pages.map((p) => p.route).sort(),
    ['/posts', '/posts/@id', '/posts/@id/edit', '/posts/new'],
  )
  assert.deepEqual(pageAt(pages, '/posts/@id').sections.map((s) => [s.block, s.screen, s.present]), [['record', 'view', 'route']])
  assert.deepEqual(pageAt(pages, '/posts/new').sections.map((s) => [s.block, s.screen, s.present]), [['form', 'create', 'route']])
  assert.deepEqual(pageAt(pages, '/posts/@id/edit').sections.map((s) => [s.block, s.screen, s.present]), [['form', 'edit', 'route']])
})

test('per-screen override: mode dialog but edit as its own route', () => {
  const pages = defineCrud('posts', { mode: 'dialog', edit: { mode: 'route', fields: [field('title')] } })
  // index page keeps list + folded view/create dialogs; edit is a separate route
  const index = pageAt(pages, '/posts')
  assert.deepEqual(screens(index), ['index', 'view', 'create'])
  assert.deepEqual(presents(index), ['route', 'dialog', 'dialog'])
  const edit = pageAt(pages, '/posts/@id/edit')
  assert.equal(edit.sections[0].present, 'route')
  assert.deepEqual(edit.sections[0].form, [{ name: 'title' }])
})

test('create inherits edit’s fields + mode when unset', () => {
  const pages = defineCrud('posts', { mode: 'route', edit: [field('title').required(), field('body')] })
  const create = pageAt(pages, '/posts/new')
  const edit = pageAt(pages, '/posts/@id/edit')
  assert.deepEqual(create.sections[0].form, [{ name: 'title', required: true }, { name: 'body' }])
  assert.deepEqual(create.sections[0].form, edit.sections[0].form)
})

test('dropping edit does NOT drop create (create falls back to schema-derived)', () => {
  const pages = defineCrud('posts', { mode: 'route', edit: false })
  assert.equal(pageAt(pages, '/posts/@id/edit'), undefined)
  const create = pageAt(pages, '/posts/new')
  assert.ok(create, 'create page still emitted')
  assert.equal(create.sections[0].form, undefined) // no refinement => derive every field
})

test('`false` drops a screen entirely', () => {
  const pages = defineCrud('posts', { mode: 'route', view: false })
  assert.equal(pageAt(pages, '/posts/@id'), undefined)
  assert.ok(pages.every((p) => p.sections.every((s) => s.block !== 'record')))
})

test('index: false drops the list page; dialog screens fall back to their own routes', () => {
  const pages = defineCrud('posts', { index: false }) // default mode dialog, but nothing to fold onto
  assert.equal(pageAt(pages, '/posts'), undefined)
  assert.deepEqual(pages.map((p) => p.route).sort(), ['/posts/@id', '/posts/@id/edit', '/posts/new'])
  assert.ok(pages.every((p) => p.sections[0].present === 'route'))
})

test('inline screens stack on the index page', () => {
  const pages = defineCrud('posts', { mode: 'inline', view: false })
  assert.equal(pages.length, 1)
  assert.deepEqual(presents(pages[0]), ['route', 'inline', 'inline']) // list + create + edit inline
})

test('column/display/field builders are collapsed to plain serializable specs', () => {
  const [index] = defineCrud('posts', { index: [column('title').sortable().searchable(), column('status')] })
  assert.deepEqual(index.sections[0].list, [{ name: 'title', sortable: true, searchable: true }, { name: 'status' }])
  // no function survives into a section
  for (const s of index.sections) for (const v of Object.values(s)) assert.notEqual(typeof v, 'function')
})

test('auth (query/onCreate/canX) rides on server-only page meta, never in a section', () => {
  const query = (q, ctx) => q.where('user_id', ctx.user.id)
  const onCreate = (ctx) => ({ user_id: ctx.user.id })
  const canEdit = (post, ctx) => ctx.user.role === 'admin'
  const [index] = defineCrud('posts', { query, onCreate, canEdit })
  assert.equal(index.crud.table, 'posts')
  assert.equal(index.crud.query, query)
  assert.equal(index.crud.onCreate, onCreate)
  assert.equal(index.crud.canEdit, canEdit)
  // sections stay serializable — no auth function leaked in
  for (const s of index.sections) for (const v of Object.values(s)) assert.notEqual(typeof v, 'function')
})

test('custom base route', () => {
  const pages = defineCrud('posts', { mode: 'route', route: '/blog' })
  assert.deepEqual(pages.map((p) => p.route).sort(), ['/blog', '/blog/@id', '/blog/@id/edit', '/blog/new'])
})

test('crud.<screen> helpers return one-section arrays (the primitive tier)', () => {
  assert.deepEqual(crud.index('posts'), [{ block: 'list', table: 'posts' }])
  assert.deepEqual(crud.view('posts', [display('title')]), [{ block: 'record', table: 'posts', record: [{ name: 'title' }] }])
  assert.deepEqual(crud.create('posts'), [{ block: 'form', table: 'posts' }])
  assert.deepEqual(crud.edit('posts', [field('x')]), [{ block: 'form', table: 'posts', form: [{ name: 'x' }] }])
})

test('bad input throws clear errors', () => {
  assert.throws(() => defineCrud(), /`table`.*is required/)
  assert.throws(() => defineCrud(123), /`table`.*is required/)
  assert.throws(() => defineCrud('posts', []), /must be an options object/)
  assert.throws(() => defineCrud('posts', { mode: 'nope' }), /`mode` must be one of/)
  assert.throws(() => defineCrud('posts', { view: 'nope' }), /must be an array of specs/)
  assert.throws(() => defineCrud('posts', { edit: { mode: 'x' } }), /`edit.mode` must be one of/)
  assert.throws(() => defineCrud('posts', { route: 'blog' }), /must be an absolute path/)
})
