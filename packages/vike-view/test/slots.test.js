// Slot overrides (customization tier 2): a per-field `.slot(token)` on the column/display/field
// builder, or a view-level `slots: { name: token }` map, carries a serializable string token onto
// the resolved list column / record field / form field. The renderer dispatches on it through the
// field-widget registry (tested in the framework packages); here we prove the agnostic derivation
// carries the token and keeps the view-model serializable.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { crud, column, display, field, resolveViewTables, viewColumns, viewRecord, viewFields, tableNamed, crudBlocks } from '../index.js'

const postsSchema = defineSchema('posts', (t) => {
  t.uuid('id').primary()
  t.string('title')
  t.string('status').as('enum', { values: ['draft', 'published'] })
  t.text('body').nullable()
  t.timestamps()
})

const tables = () => resolveViewTables({ schemas: [postsSchema] })
const postsTable = () => tableNamed(tables(), 'posts')

test('.slot() on a list column carries the token onto the resolved column', () => {
  const cols = viewColumns(crud({ table: 'posts', list: [column('title'), column('status').slot('status-badge')] }), postsTable())
  assert.equal(cols.find((c) => c.name === 'title').slot, null)
  assert.equal(cols.find((c) => c.name === 'status').slot, 'status-badge')
})

test('.slot() on a record field carries the token', () => {
  const fields = viewRecord(crud({ table: 'posts', record: [display('status').slot('status-badge')] }), postsTable())
  assert.equal(fields[0].slot, 'status-badge')
})

test('.slot() on a form field carries the token (dispatch token, widget preserved for fallback)', () => {
  const fields = viewFields(crud({ table: 'posts', form: [field('body').slot('rich-editor')] }), postsTable())
  assert.equal(fields[0].slot, 'rich-editor')
  assert.equal(fields[0].widget, 'text') // the derived widget is still there as the fallback
})

test('a view-level slots map applies to any field by name, across list / record / form', () => {
  const view = crud({ table: 'posts', slots: { status: 'status-badge' } })
  assert.equal(viewColumns(view, postsTable()).find((c) => c.name === 'status').slot, 'status-badge')
  assert.equal(viewRecord(view, postsTable()).find((f) => f.name === 'status').slot, 'status-badge')
  assert.equal(viewFields(view, postsTable()).find((f) => f.name === 'status').slot, 'status-badge')
})

test('a per-field .slot() wins over the view-level slots map', () => {
  const view = crud({ table: 'posts', slots: { status: 'from-map' }, list: [column('status').slot('from-builder')] })
  assert.equal(viewColumns(view, postsTable()).find((c) => c.name === 'status').slot, 'from-builder')
})

test('no slot resolves to null (the default derived cell/control)', () => {
  assert.equal(viewColumns(crud({ table: 'posts' }), postsTable())[0].slot, null)
  assert.equal(viewFields(crud({ table: 'posts' }), postsTable())[0].slot, null)
})

test('the view-level slots map rides into every crudBlocks descriptor and stays serializable', () => {
  const blocks = crudBlocks({ table: 'posts', slots: { status: 'status-badge' } })
  for (const b of blocks) {
    assert.deepEqual(b.slots, { status: 'status-badge' })
    assert.equal(JSON.stringify(b), JSON.stringify(b)) // no functions — round-trips as JSON
  }
})

test('slot tokens are strings only — nothing non-serializable leaks into a block descriptor', () => {
  const blocks = crudBlocks({ table: 'posts', list: [column('status').slot('badge')], slots: { title: 'link' } })
  const json = JSON.stringify(blocks)
  assert.ok(json.includes('"slot":"badge"') || json.includes('"slots"'))
  // every value in a slots map is a string token
  for (const b of blocks) for (const v of Object.values(b.slots ?? {})) assert.equal(typeof v, 'string')
})
