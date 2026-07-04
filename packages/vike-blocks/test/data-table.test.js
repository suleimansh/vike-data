// The data-table block: the plain table upgraded with filter / row-selection / column-visibility
// (defineBlock, type 'data-table', builder `dataTable`). The renderer is not node:test-tested (JSX/Vue
// stateful + DOM checkboxes + the popover menu), so this covers the agnostic builder + resolve (feature
// flags, column derivation shared with `table`) and the pure `rowMatchesQuery` helper the renderers
// share. Also guards that the shared-helper refactor left the `table` block resolving unchanged.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dataTable, table, definePage, resolvePage, hasBlock } from '../index.js'
import { rowMatchesQuery, normalizeColumn } from '../blocks/table-styles.js'

const rows = [
  { name: 'Ada', role: 'Admin', active: true },
  { name: 'Grace', role: 'Editor', active: false },
]

test('data-table is registered', () => {
  assert.ok(hasBlock('data-table'))
})

test('resolve derives columns from the first row and defaults every feature off', () => {
  const out = resolvePage(definePage({ sections: [dataTable({ rows })] }))
  const r = out.sections[0].resolved
  assert.deepEqual(r.columns.map((c) => c.key), ['name', 'role', 'active'])
  assert.equal(r.sortable, false)
  assert.equal(r.filter, false)
  assert.equal(r.selectable, false)
  assert.equal(r.columnToggle, false)
  assert.equal(r.empty, 'No rows.')
})

test('the feature builders flip their flags; .filter(str) sets the placeholder', () => {
  const built = dataTable({ columns: ['name'], rows }).sortable().filter('Find...').selectable().columnToggle().empty('Nada').build()
  assert.equal(built.sortable, true)
  assert.equal(built.filter, 'Find...')
  assert.equal(built.selectable, true)
  assert.equal(built.columnToggle, true)
  const out = resolvePage(definePage({ sections: [dataTable({ rows }).sortable().filter('Find...').selectable().columnToggle()] }))
  const r = out.sections[0].resolved
  assert.equal(r.sortable, true)
  assert.equal(r.filter, true)
  assert.equal(r.filterPlaceholder, 'Find...')
  assert.equal(r.selectable, true)
  assert.equal(r.columnToggle, true)
})

test('bare .filter() enables the box with the default placeholder', () => {
  const r = resolvePage(definePage({ sections: [dataTable({ rows }).filter()] })).sections[0].resolved
  assert.equal(r.filter, true)
  assert.equal(r.filterPlaceholder, 'Search...')
})

test('rowMatchesQuery matches formatted cell values across columns (case-insensitive)', () => {
  const cols = ['name', 'role', 'active'].map(normalizeColumn)
  assert.equal(rowMatchesQuery(rows[0], cols, ''), true) // empty query -> all match
  assert.equal(rowMatchesQuery(rows[0], cols, 'adm'), true) // role Admin
  assert.equal(rowMatchesQuery(rows[0], cols, 'GRACE'), false)
  // a boolean column matches its formatted "yes" / "no"
  assert.equal(rowMatchesQuery(rows[0], cols, 'yes'), true)
  assert.equal(rowMatchesQuery(rows[1], cols, 'no'), true)
})

test('the shared-helper refactor left the table block resolving unchanged', () => {
  const out = resolvePage(definePage({ sections: [table({ columns: ['first_name'], rows: [{ first_name: 'Ada' }] }).sortable()] }))
  const r = out.sections[0].resolved
  assert.equal(r.columns[0].key, 'first_name')
  assert.equal(r.columns[0].label, 'First Name') // humanize still applied
  assert.equal(r.sortable, true)
})
