// The table block: a non-schema data table (rows + columns in, a themed table out). The renderers
// are JSX/Vue (not node:test-tested), so this covers the agnostic builder, column normalization,
// the resolve view-model, and the shared formatter + sort comparator.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { table, definePage, resolvePage, getBlock, hasBlock } from '../index.js'
import { formatValue, compareRows } from '../table-styles.js'

const resolveTable = (builder) => getBlock('table').resolve({ props: builder.build() })

const people = [
  { name: 'Ada', role: 'Admin', joined: 3 },
  { name: 'Bo', role: 'Member', joined: 1 },
]

test('table is registered', () => {
  assert.ok(hasBlock('table'))
})

test('the builder collapses to a { block, ...props } descriptor', () => {
  const d = table({ columns: ['name', 'role'], rows: people }).build()
  assert.equal(d.block, 'table')
  assert.deepEqual(d.columns, ['name', 'role'])
  assert.equal(d.rows.length, 2)
})

test('string columns normalize to { key, label, align, format } with a humanized label', () => {
  const out = resolveTable(table({ columns: ['first_name', 'joinedAt'], rows: [] }))
  assert.deepEqual(out.columns[0], { key: 'first_name', label: 'First Name', align: 'left', format: null })
  assert.deepEqual(out.columns[1], { key: 'joinedAt', label: 'Joined At', align: 'left', format: null })
})

test('object columns keep their explicit label / align / format and humanize a missing label', () => {
  const out = resolveTable(table({ columns: [{ key: 'total', align: 'right', format: 'since' }, { key: 'name', label: 'Full name' }], rows: [] }))
  assert.deepEqual(out.columns[0], { key: 'total', label: 'Total', align: 'right', format: 'since' })
  assert.deepEqual(out.columns[1], { key: 'name', label: 'Full name', align: 'left', format: null })
})

test('with no columns, they are derived from the first row keys', () => {
  const out = resolveTable(table({ rows: people }))
  assert.deepEqual(out.columns.map((c) => c.key), ['name', 'role', 'joined'])
})

test('rows pass through; a missing / non-array rows resolves to an empty table', () => {
  assert.equal(resolveTable(table({ rows: people })).rows.length, 2)
  assert.deepEqual(resolveTable(table({ columns: ['a'] })).rows, [])
  assert.deepEqual(resolveTable(table({ columns: ['a'], rows: 'nope' })).rows, [])
})

test('sortable defaults off; .sortable() turns it on; empty defaults and .empty() overrides', () => {
  assert.equal(resolveTable(table({ rows: [] })).sortable, false)
  assert.equal(resolveTable(table({ rows: [] }).sortable()).sortable, true)
  assert.equal(resolveTable(table({ rows: [] })).empty, 'No rows.')
  assert.equal(resolveTable(table({ rows: [] }).empty('No members yet')).empty, 'No members yet')
})

test('.rows() / .columns() inject data after construction (the API-results pattern)', () => {
  const out = resolveTable(table({ columns: ['name'] }).rows(people))
  assert.equal(out.rows.length, 2)
  assert.equal(out.columns[0].key, 'name')
})

test('formatValue mirrors the ListView formatters (blank / boolean / raw)', () => {
  assert.equal(formatValue(null), '')
  assert.equal(formatValue(undefined), '')
  assert.equal(formatValue(true), 'yes')
  assert.equal(formatValue(false), 'no')
  assert.equal(formatValue(42), '42')
})

test('compareRows sorts numbers numerically and strings lexically, with a direction flip', () => {
  assert.ok(compareRows({ n: 2 }, { n: 10 }, 'n', 'asc') < 0) // numeric, not '2' > '10'
  assert.ok(compareRows({ n: 2 }, { n: 10 }, 'n', 'desc') > 0)
  assert.ok(compareRows({ s: 'a' }, { s: 'b' }, 's', 'asc') < 0)
})

test('compareRows sorts null / undefined last regardless of direction', () => {
  assert.ok(compareRows({ n: null }, { n: 1 }, 'n', 'asc') > 0)
  assert.ok(compareRows({ n: null }, { n: 1 }, 'n', 'desc') > 0)
  assert.equal(compareRows({ n: null }, { n: null }, 'n', 'asc'), 0)
})

test('resolves as a section through a page', () => {
  const out = resolvePage(definePage({ sections: [table({ columns: ['name'], rows: people }).sortable()] }))
  assert.equal(out.sections[0].block, 'table')
  assert.equal(out.sections[0].resolved.sortable, true)
  assert.equal(out.sections[0].resolved.rows.length, 2)
})
