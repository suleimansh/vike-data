// The `data-table` block — the plain `table` upgraded into a data table: a global search filter, row
// selection (a checkbox column + select-all), and column-visibility controls, all on top of the same
// non-schema rows + columns. Builds on the `table` block's chrome (shared cell / header / formatter /
// sort helpers in table-styles), and stays the plain-data counterpart to vike-crud's schema-driven
// list. Every feature is opt-in; the filtering / selection / visibility are local UI state in the
// renderer (selection binding is the actions axis, #385). Dep-free, theme-native, cross-framework.
//
//   dataTable({ columns: ['name', 'role', 'active'], rows })
//     .sortable()          // client-side sort toggles on the headers
//     .filter('Search people...')  // a search box that filters across the columns
//     .selectable()        // a checkbox column + select-all + a selected count
//     .columnToggle()      // a "Columns" menu to show / hide columns
//     .empty('No people')
//
// A column spec is a string (the row key) or `{ key, label, align, format }`, identical to `table`.
import { defineBlock } from '../core/registry.js'
import { normalizeColumn } from './table-styles.js'

export const dataTable = defineBlock('data-table', {
  category: 'data',
  summary: "A data table with sortable columns and row actions.",
  example: "dataTable({ columns: ['name', 'role'], rows: [{ name: 'Ada', role: 'Admin' }] })",
  build: ({ columns, rows } = {}) => ({
    ...(columns !== undefined ? { columns } : {}),
    ...(rows !== undefined ? { rows } : {}),
  }),
  refine: {
    columns: (columns) => ({ columns }),
    rows: (rows) => ({ rows }),
    sortable: (on = true) => ({ sortable: on }),
    // .filter() enables a search box; .filter('placeholder') also sets its placeholder.
    filter: (placeholder = true) => ({ filter: placeholder }),
    selectable: (on = true) => ({ selectable: on }),
    columnToggle: (on = true) => ({ columnToggle: on }),
    empty: (label) => ({ empty: label }),
  },
  // A serializable view-model: normalized columns (explicit, else derived from the first row's keys) +
  // the rows passed through + the feature flags. The renderer owns the live sort / query / selection /
  // hidden-column state.
  resolve({ props }) {
    const rows = Array.isArray(props.rows) ? props.rows : []
    const cols = Array.isArray(props.columns) && props.columns.length ? props.columns : Object.keys(rows[0] ?? {})
    const filter = props.filter === true || typeof props.filter === 'string'
    return {
      columns: cols.map(normalizeColumn),
      rows,
      sortable: props.sortable === true,
      filter,
      filterPlaceholder: typeof props.filter === 'string' ? props.filter : 'Search...',
      selectable: props.selectable === true,
      columnToggle: props.columnToggle === true,
      empty: props.empty ?? 'No rows.',
    }
  },
})
