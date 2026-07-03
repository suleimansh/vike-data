// The `table` block — a NON-schema data table: feed it rows + columns directly (API results,
// computed data) and it draws a themed table. This is the plain-data counterpart to vike-crud's
// schema-driven `list`/`record`/`form` (which derive their columns from a table). It shares the
// visual chrome of vike-crud's ListView (headers, cell padding, empty state, named formatters)
// without pulling in the schema path, so a hand-fed table themes identically. Dep-free,
// theme-native, cross-framework.
//
//   table({ columns: ['name', 'role', 'joined'], rows })
//     .sortable()
//     .empty('No members yet')
//
// A column spec is a string (the row key; the label is humanized) or an object with any of
// `{ key, label, align, format }`. `format` reuses ListView's named client formatters:
//   - 'since'   -> a relative time ("3 days ago")
//   - a boolean value renders yes / no
//   - anything else renders the raw value as a string
//
// With no `columns`, they are derived from the first row's keys. `.sortable()` makes every header
// a client-side sort toggle (local UI state, like the code block's copy button).
//
// `.rowActions([...])` adds a trailing actions column: action-button blocks whose `params` tokens
// resolve against each row (`$row.<col>`), so one descriptor drives a per-row button (the actions
// axis, #385). The renderer resolves the params against the row and draws each button, which runs
// through the vike-actions runner like any action block.
//
//   table({ columns: ['title', 'published'], rows })
//     .rowActions([button('Publish').action('publish').params({ id: '$row.id' })])
import { defineBlock } from '../core/registry.js'
import { collapseSections as collapse } from '../core/page.js'

// Collapse builders to plain descriptors (a no-op for descriptors already) — same as form/card do,
// so `.rowActions([...])` accepts fluent builders and resolve gets serializable specs.

// A row key -> a human label: split snake/kebab/camelCase into words and title-case them.
const humanize = (key) =>
  String(key)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())

// Normalize a column spec (string or object) to a full { key, label, align, format }.
const normalizeColumn = (c) => {
  if (typeof c === 'string') return { key: c, label: humanize(c), align: 'left', format: null }
  const key = c?.key
  return { key, label: c?.label ?? humanize(key), align: c?.align ?? 'left', format: c?.format ?? null }
}

export const table = defineBlock('table', {
  build: ({ columns, rows } = {}) => ({
    ...(columns !== undefined ? { columns } : {}),
    ...(rows !== undefined ? { rows } : {}),
  }),
  refine: {
    columns: (columns) => ({ columns }),
    rows: (rows) => ({ rows }),
    sortable: (on = true) => ({ sortable: on }),
    empty: (label) => ({ empty: label }),
    rowActions: (actions) => ({ rowActions: collapse(actions) }),
  },
  // A serializable view-model: normalized columns (explicit, else derived from the first row's
  // keys) + the rows passed through + the row-action descriptors (collapsed to plain specs). All
  // plain data, so both renderers stay thin.
  resolve({ props }) {
    const rows = Array.isArray(props.rows) ? props.rows : []
    const cols = Array.isArray(props.columns) && props.columns.length ? props.columns : Object.keys(rows[0] ?? {})
    return {
      columns: cols.map(normalizeColumn),
      rows,
      sortable: props.sortable === true,
      empty: props.empty ?? 'No rows.',
      rowActions: collapse(props.rowActions),
    }
  },
})
