// The Vue renderer for the `table` block — the Vue twin of react/TableView.jsx. A stateful
// component (a `sort` ref for the client-side sort); everything else reads the shared table-styles
// module (cell/header chrome, named formatters, the sort comparator), so it can't drift from the
// React renderer.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { tableCell, tableHeader, formatValue, compareRows } from '../table-styles.js'

export const TableView = {
  props: ['columns', 'rows', 'sortable', 'empty'],
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
          }),
        ),
      ])

      const body = h(
        'tbody',
        sorted.length === 0
          ? [h('tr', [h('td', { style: { ...tableCell, color: 'var(--color-muted, #64748b)' }, colspan: columns.length || 1 }, empty)])]
          : sorted.map((row, i) =>
              h(
                'tr',
                { key: i },
                columns.map((c) => h('td', { key: c.key, style: { ...tableCell, textAlign: c.align || 'left' } }, formatValue(row[c.key], c.format))),
              ),
            ),
      )

      return h('table', { style: { width: '100%', borderCollapse: 'collapse' }, 'data-slot': 'table' }, [head, body])
    }
  },
}

registerBlockRenderer('table', TableView)
