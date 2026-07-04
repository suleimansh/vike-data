// #574 — a form (or list) composed into a container block (card, tabs, ...) must still be found by
// the POST handler and hydrated, exactly as a top-level one is. Before the fix, formFieldsFor and
// hydrateView only scanned top-level sections, so a card-wrapped form silently broke create/update
// (no fields found -> 302 writes nothing; a nested edit form stayed blank and would wipe the row).
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { setAdapter, clearAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'
import { card, tabs } from 'vike-blocks'
import { definePage, resolveViewTables, buildDb, hydrateView, findSection } from '../index.js'
import { formFieldsFor } from '../react/pages.js'

const posts = defineSchema('posts', (t) => {
  t.uuid('id').primary()
  t.string('title')
  t.uuid('user_id') // owner
  t.timestamps()
})
const config = { schemas: [posts] }
const tables = () => resolveViewTables(config)
const scope = (_t, ctx) => ({ user_id: ctx.user.id })
const u1 = { user: { id: 'u1' } }

let db
beforeEach(async () => {
  clearAdapter()
  setAdapter(createMemoryAdapter())
  db = buildDb(tables())
  await db.posts.insert({ id: 'p1', title: 'Alice', user_id: 'u1' })
})

// A form / list block descriptor for posts, and the same wrapped one section deep in a card.
const formBlock = { block: 'form', table: 'posts' }
const listBlock = { block: 'list', table: 'posts' }
const cardFormView = definePage({ route: '/posts', sections: [{ block: 'markdown', source: '# Posts' }, card([formBlock]).title('New post')] })
const flatFormView = definePage({ route: '/posts', sections: [formBlock] })

test('formFieldsFor finds a form nested in a card (parity with a top-level form)', () => {
  const nested = formFieldsFor(cardFormView, tables(), 'posts')
  const flat = formFieldsFor(flatFormView, tables(), 'posts')
  assert.ok(nested, 'nested form fields should be found, not null')
  assert.deepEqual(nested.map((f) => f.name), flat.map((f) => f.name))
  assert.ok(nested.some((f) => f.name === 'title'))
})

test('formFieldsFor finds a form nested in a tabs panel', () => {
  const tabView = definePage({ route: '/posts', sections: [tabs().tab('new', 'New', [formBlock])] })
  assert.ok(formFieldsFor(tabView, tables(), 'posts')?.some((f) => f.name === 'title'))
})

test('hydrateView pre-fills a nested EDIT form (no blank-over-live-data)', async () => {
  const out = await hydrateView(cardFormView, { tables: tables(), db, scope, ctx: u1, id: 'p1' })
  const form = findSection(out.sections, (s) => s.block === 'form')
  assert.equal(form.resolved.values.title, 'Alice')
})

test('hydrateView hydrates a nested LIST too', async () => {
  const view = definePage({ route: '/posts', sections: [card([listBlock]).title('All')] })
  const out = await hydrateView(view, { tables: tables(), db, scope, ctx: u1 })
  const list = findSection(out.sections, (s) => s.block === 'list')
  assert.equal(list.resolved.rows.length, 1)
  assert.equal(list.resolved.rows[0].title, 'Alice')
})

test('the enclosing container is preserved (form stays inside the card)', async () => {
  const out = await hydrateView(cardFormView, { tables: tables(), db, scope, ctx: u1, id: 'p1' })
  const cardSection = out.sections.find((s) => s.block === 'card')
  assert.ok(cardSection, 'the card section should still be present at top level')
  assert.equal(cardSection.resolved.sections[0].block, 'form')
  assert.equal(cardSection.resolved.sections[0].resolved.values.title, 'Alice')
})
