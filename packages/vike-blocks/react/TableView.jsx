// The React renderer for the `table` block — a non-schema data table. Draws the resolved
// columns + rows with the shared table chrome (so it themes like vike-view's ListView). When the
// block is `.sortable()`, headers become client-side sort toggles; the sort is purely local UI
// state (like the code block's copy button), so no actions layer is involved.
import { useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import { tableCell, tableHeader, formatValue, compareRows } from '../table-styles.js'

export function TableView({ columns = [], rows = [], sortable = false, empty = 'No rows.' }) {
  const [sort, setSort] = useState(null) // { key, dir } | null

  const onSort = (key) => setSort((s) => (s && s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  const sorted = sortable && sort ? [...rows].sort((a, b) => compareRows(a, b, sort.key, sort.dir)) : rows

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }} data-slot="table">
      <thead>
        <tr>
          {columns.map((c) => {
            const active = sort?.key === c.key
            const arrow = active ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''
            return (
              <th
                key={c.key}
                style={{ ...tableHeader, textAlign: c.align || 'left', cursor: sortable ? 'pointer' : 'default', userSelect: 'none' }}
                onClick={sortable ? () => onSort(c.key) : undefined}
                aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
              >
                {c.label}
                {arrow}
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0 ? (
          <tr>
            <td style={{ ...tableCell, color: 'var(--color-muted, #64748b)' }} colSpan={columns.length || 1}>
              {empty}
            </td>
          </tr>
        ) : (
          sorted.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} style={{ ...tableCell, textAlign: c.align || 'left' }}>
                  {formatValue(row[c.key], c.format)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

registerBlockRenderer('table', TableView)
