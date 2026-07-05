// vike-crud's schema-driven blocks: crudBlocks expands a table into list/record/form block
// descriptors, and resolveView derives each from the composed schema through the crud engine.
// The generic composer/registry behavior is tested in vike-blocks; this is the schema layer.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { definePage, resolveView, crudBlocks, resolveViewTables, describeBlock, blockCatalog } from '../index.js'

const posts = defineSchema('posts', (t) => {
  t.uuid('id').primary()
  t.string('title')
  t.text('body').nullable()
  t.uuid('author_id').references('users.id', { onDelete: 'cascade' })
  t.timestamps()
})
const users = defineSchema('users', (t) => {
  t.uuid('id').primary()
  t.string('email').unique().as('email')
})
const tables = () => resolveViewTables({ schemas: [posts, users] })

test('crudBlocks expands a table into list/record/form, mixable with single blocks', () => {
  const view = definePage({ route: '/x', sections: [{ block: 'markdown', source: '# Posts' }, crudBlocks({ table: 'posts' })] })
  assert.deepEqual(view.sections.map((s) => s.block), ['markdown', 'list', 'record', 'form'])
})

test('resolveView derives list/record/form blocks from the schema via the crud engine', () => {
  const out = resolveView(definePage({ route: '/posts', sections: crudBlocks({ table: 'posts' }) }), tables())
  assert.equal(out.route, '/posts')
  const [list, record, form] = out.sections
  assert.ok(list.resolved.columns.some((c) => c.name === 'title'))
  assert.equal(record.resolved.fields.find((f) => f.name === 'author_id').fk.table, 'users')
  assert.equal(form.resolved.fields.find((f) => f.name === 'author_id').type, 'select')
})

test('a table block against a missing table is a clear error', () => {
  assert.throws(() => resolveView(definePage({ sections: [{ block: 'list', table: 'ghosts' }] }), tables()), /not in the composed schema/)
})

test('crudBlocks descriptors are independent and carry no functions (serializable)', () => {
  const [list, record, form] = crudBlocks({ table: 'posts', list: [{ name: 'title' }], scope: () => ({ x: 1 }), canEdit: () => true })
  // only the key each block reads, no cross-block sharing, no scope/canEdit functions leaked
  assert.deepEqual(list, { block: 'list', table: 'posts', list: [{ name: 'title' }] })
  assert.deepEqual(record, { block: 'record', table: 'posts' })
  assert.deepEqual(form, { block: 'form', table: 'posts' })
  for (const b of [list, record, form]) for (const v of Object.values(b)) assert.notEqual(typeof v, 'function')
})

test('the schema-derived blocks describe themselves in the catalog (agent discovery)', () => {
  for (const type of ['list', 'record', 'form']) {
    const d = describeBlock(type)
    assert.equal(d.category, 'data')
    assert.equal(typeof d.summary, 'string')
    assert.equal(d.passThrough, false) // they have a resolve step
    assert.deepEqual(d.params?.[0], { name: 'table', required: true })
    assert.ok(d.example.includes(`block: '${type}'`))
  }
  // and the whole catalog is reachable through the vike-crud umbrella (not just vike-blocks)
  const cat = blockCatalog()
  assert.equal(cat.contractVersion, 1)
  assert.ok(cat.blocks.some((b) => b.type === 'list' && b.category === 'data'))
})

test('resolveView without the composed tables gives an actionable error', () => {
  assert.throws(
    () => resolveView(definePage({ sections: crudBlocks({ table: 'posts' }) })),
    /pass the composed tables as the second argument/,
  )
})
