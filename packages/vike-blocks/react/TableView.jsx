// The React renderer for the `table` block — a non-schema data table. Draws the resolved
// columns + rows with the shared table chrome (so it themes like vike-crud's ListView). When the
// block is `.sortable()`, headers become client-side sort toggles; the sort is purely local UI
// state (like the code block's copy button). With `.rowActions([...])`, a trailing actions column
// draws each action block per row, its `params` tokens resolved against that row — the button then
// runs through the vike-actions runner like any action block.
import { useState } from 'react'
import { registerBlockRenderer, getBlockRenderer } from './registry.js'
import { resolveParams } from '../core/params.js'
import { tableCell, tableHeader, formatValue, compareRows } from '../blocks/table-styles.js'

// Draw one row's action buttons: resolve each descriptor's params against the row (so `$row.id`
// becomes the real id), then render it through its registered block renderer (an action button).
function RowActions({ actions, row }) {
  return (
    <span style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
      {actions.map(({ block, params, ...rest }, i) => {
        const Renderer = getBlockRenderer(block)
        return Renderer ? <Renderer key={i} {...rest} params={resolveParams(params, { row })} /> : null
      })}
    </span>
  )
}

export function TableView({ columns = [], rows = [], sortable = false, empty = 'No rows.', rowActions = [] }) {
  const [sort, setSort] = useState(null) // { key, dir } | null
  const hasActions = Array.isArray(rowActions) && rowActions.length > 0

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
          {hasActions && <th style={{ ...tableHeader, textAlign: 'right' }} aria-label="Actions" />}
        </tr>
      </thead>
      <tbody>
        {sorted.length === 0 ? (
          <tr>
            <td style={{ ...tableCell, color: 'var(--color-muted, #64748b)' }} colSpan={(columns.length || 1) + (hasActions ? 1 : 0)}>
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
              {hasActions && (
                <td style={{ ...tableCell, textAlign: 'right' }}>
                  <RowActions actions={rowActions} row={row} />
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

registerBlockRenderer('table', TableView)
