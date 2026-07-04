// #579 — honouring `present` in the renderer. Two pure pieces the client ViewPage builds on:
// `sectionHasContent` keeps an empty CRUD block off the page (no stray empty record / edit form),
// and the `nav` descriptor defineCrud attaches to the index list tells the list how to reach each
// screen (route URL vs `?screen=` query vs inline-on-page).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { defineCrud } from '../index.js'
import { sectionHasContent } from '../react/pages.js'

const sec = (block, props, resolved) => ({ block, props, resolved })

test('sectionHasContent: list / heading / text always render', () => {
  assert.equal(sectionHasContent(sec('list', {}, { rows: [] })), true)
  assert.equal(sectionHasContent(sec('heading', {}, {})), true)
})

test('sectionHasContent: a record needs a row', () => {
  assert.equal(sectionHasContent(sec('record', { screen: 'view' }, { row: { id: 'p1' } })), true)
  assert.equal(sectionHasContent(sec('record', { screen: 'view' }, { row: null })), false)
})

test('sectionHasContent: a form renders unless it is an empty edit', () => {
  assert.equal(sectionHasContent(sec('form', { screen: 'create' }, { values: {}, pk: 'id' })), true) // blank create IS the point
  assert.equal(sectionHasContent(sec('form', {}, { values: {}, pk: 'id' })), true) // legacy untagged form = create
  assert.equal(sectionHasContent(sec('form', { screen: 'edit' }, { values: {}, pk: 'id' })), false) // empty edit on an index
  assert.equal(sectionHasContent(sec('form', { screen: 'edit' }, { values: { id: 'p1' }, pk: 'id' })), true) // edit with a row
})

const indexNav = (opts) => defineCrud('posts', opts)[0].sections[0].nav

test('defineCrud attaches a nav descriptor to the index list per screen presentation', () => {
  assert.deepEqual(indexNav({ mode: 'dialog' }), { base: '/posts', view: 'dialog', create: 'dialog', edit: 'dialog' })
  assert.deepEqual(indexNav({ mode: 'route' }), { base: '/posts', view: 'route', create: 'route', edit: 'route' })
  assert.deepEqual(indexNav({ mode: 'inline' }), { base: '/posts', view: 'inline', create: 'inline', edit: 'inline' })
})

test('nav omits a dropped screen and honours per-screen overrides + base', () => {
  assert.deepEqual(indexNav({ mode: 'dialog', edit: false }), { base: '/posts', view: 'dialog', create: 'dialog' })
  assert.deepEqual(indexNav({ mode: 'dialog', edit: { mode: 'route' }, route: '/blog' }), { base: '/blog', view: 'dialog', create: 'dialog', edit: 'route' })
})
