// The Vue renderer for the `table` block — the Vue twin of react/TableView.jsx. A stateful
// component (a `sort` ref for the client-side sort); everything else reads the shared table-styles
// module (cell/header chrome, named formatters, the sort comparator), so it can't drift from the
// React renderer.
import { h, ref } from 'vue'
import { registerBlockRenderer, getBlockRenderer } from './registry.js'
import { resolveParams } from '../core/params.js'
import { tableCell, tableHeader, formatValue, compareRows } from '../blocks/table-styles.js'

// One row's action buttons: resolve each descriptor's params against the row, then render it
// through its registered block renderer (an action button that runs via the vike-actions runner).
const rowActionsCell = (actions, row) =>
  h(
    'span',
    { style: { display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' } },
    actions.map(({ block, params, ...rest }, i) => {
      const Renderer = getBlockRenderer(block)
      return Renderer ? h(Renderer, { key: i, ...rest, params: resolveParams(params, { row }) }) : null
    }),
  )

export const TableView = {
  props: ['columns', 'rows', 'sortable', 'empty', 'rowActions'],
  setup(props) {
    const sort = ref(null) // { key, dir } | null
    const onSort = (key) => {
      const s = sort.value
      sort.value = s && s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    }

    return () => {
      const columns = props.columns ?? []
      const rows = props.rows ?? []
      const sortable = props.sortable === true
      const empty = props.empty ?? 'No rows.'
      const rowActions = Array.isArray(props.rowActions) ? props.rowActions : []
      const hasActions = rowActions.length > 0
      const sorted = sortable && sort.value ? [...rows].sort((a, b) => compareRows(a, b, sort.value.key, sort.value.dir)) : rows

      const head = h('thead', [
        h(
          'tr',
          columns.map((c) => {
            const active = sort.value?.key === c.key
            const arrow = active ? (sort.value.dir === 'asc' ? ' ↑' : ' ↓') : ''
            return h(
              'th',
              {
                key: c.key,
                style: { ...tableHeader, textAlign: c.align || 'left', cursor: sortable ? 'pointer' : 'default', userSelect: 'none' },
                onClick: sortable ? () => onSort(c.key) : undefined,
                'aria-sort': active ? (sort.value.dir === 'asc' ? 'ascending' : 'descending') : undefined,
              },
              `${c.label}${arrow}`,
            )
          }).concat(hasActions ? [h('th', { key: '__actions', style: { ...tableHeader, textAlign: 'right' }, 'aria-label': 'Actions' })] : []),
        ),
      ])

      const body = h(
        'tbody',
        sorted.length === 0
          ? [h('tr', [h('td', { style: { ...tableCell, color: 'var(--color-muted, #64748b)' }, colspan: (columns.length || 1) + (hasActions ? 1 : 0) }, empty)])]
          : sorted.map((row, i) =>
              h(
                'tr',
                { key: i },
                columns
                  .map((c) => h('td', { key: c.key, style: { ...tableCell, textAlign: c.align || 'left' } }, formatValue(row[c.key], c.format)))
                  .concat(hasActions ? [h('td', { key: '__actions', style: { ...tableCell, textAlign: 'right' } }, [rowActionsCell(rowActions, row)])] : []),
              ),
            ),
      )

      return h('table', { style: { width: '100%', borderCollapse: 'collapse' }, 'data-slot': 'table' }, [head, body])
    }
  },
}

registerBlockRenderer('table', TableView)
