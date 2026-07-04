// The React renderer for the `data-table` block — the plain table upgraded with a search filter, row
// selection (a checkbox column + select-all), and column-visibility controls. The table body reuses the
// shared `table` chrome (cell / header / formatter / sort comparator); the toolbar chrome + the pure
// filter live in the data-table-styles + table-styles modules, so this can't drift from the Vue twin.
// Sort / query / selection / hidden-columns are all local UI state (selection binding is #385), so SSR
// renders the initial view and the first client render agrees. The columns menu reuses the popover
// primitive (anchor + outside-click + Escape).
import { useState, useRef, useEffect } from 'react'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.jsx'
import { popoverSurfaceStyle, popoverMotionStyle } from '../blocks/popover-styles.js'
import { tableCell, tableHeader, formatValue, compareRows, rowMatchesQuery } from '../blocks/table-styles.js'
import {
  dataTableToolbarStyle,
  dataTableSearchStyle,
  dataTableColumnsButtonStyle,
  dataTableColumnItemStyle,
  dataTableSelectionStyle,
  dataTableCheckboxCellStyle,
  dataTableCheckboxStyle,
  DATA_TABLE_STYLE_TAG,
} from '../blocks/data-table-styles.js'

// A native checkbox whose `indeterminate` (a DOM-only property, not an attribute) is kept in sync.
function Check({ checked, indeterminate = false, onChange, label }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} aria-label={label} style={dataTableCheckboxStyle()} />
}

export function DataTableView({ columns = [], rows = [], sortable = false, filter = false, filterPlaceholder = 'Search...', selectable = false, columnToggle = false, empty = 'No rows.' }) {
  const [sort, setSort] = useState(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(() => new Set())
  const [hidden, setHidden] = useState(() => new Set())
  const [menuOpen, setMenuOpen] = useState(false)

  const visibleColumns = columns.filter((c) => !hidden.has(c.key))
  const onSort = (key) => setSort((s) => (s && s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  // Keep each row's original index so selection survives sorting + filtering.
  const indexed = rows.map((row, i) => ({ row, i }))
  const filtered = filter ? indexed.filter(({ row }) => rowMatchesQuery(row, visibleColumns, query)) : indexed
  const view = sortable && sort ? [...filtered].sort((a, b) => compareRows(a.row, b.row, sort.key, sort.dir)) : filtered

  const visibleIndices = view.map((v) => v.i)
  const allSelected = visibleIndices.length > 0 && visibleIndices.every((i) => selected.has(i))
  const someSelected = visibleIndices.some((i) => selected.has(i))

  const toggleRow = (i) =>
    setSelected((cur) => {
      const next = new Set(cur)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  const toggleAll = () =>
    setSelected((cur) => {
      const next = new Set(cur)
      if (allSelected) visibleIndices.forEach((i) => next.delete(i))
      else visibleIndices.forEach((i) => next.add(i))
      return next
    })
  const toggleColumn = (key) =>
    setHidden((cur) => {
      const next = new Set(cur)
      if (next.has(key)) next.delete(key)
      else if (columns.length - next.size > 1) next.add(key) // keep at least one column visible
      return next
    })

  const colSpan = visibleColumns.length + (selectable ? 1 : 0)

  return (
    <div data-slot="data-table">
      <style>{DATA_TABLE_STYLE_TAG}</style>
      {(filter || columnToggle) && (
        <div style={dataTableToolbarStyle()}>
          {filter ? (
            <input
              type="search"
              className="vike-blocks-dtsearch"
              value={query}
              placeholder={filterPlaceholder}
              onChange={(e) => setQuery(e.target.value)}
              style={dataTableSearchStyle()}
              aria-label={filterPlaceholder}
            />
          ) : (
            <span />
          )}
          {columnToggle && (
            <Popover
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              placement="bottom-end"
              role="menu"
              trigger={
                <button type="button" style={dataTableColumnsButtonStyle()} aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
                  Columns
                </button>
              }
              panelStyle={(v, pl) => ({ ...popoverSurfaceStyle(), ...popoverMotionStyle(v, pl) })}
            >
              <div data-slot="data-table-columns">
                {columns.map((c) => (
                  <label key={c.key} className="vike-blocks-dtcol" style={dataTableColumnItemStyle()}>
                    <input type="checkbox" checked={!hidden.has(c.key)} onChange={() => toggleColumn(c.key)} style={dataTableCheckboxStyle()} />
                    {c.label}
                  </label>
                ))}
              </div>
            </Popover>
          )}
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {selectable && (
              <th style={{ ...tableHeader, ...dataTableCheckboxCellStyle() }}>
                <Check checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} label="Select all rows" />
              </th>
            )}
            {visibleColumns.map((c) => {
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
          {view.length === 0 ? (
            <tr>
              <td style={{ ...tableCell, color: 'var(--color-muted, #64748b)' }} colSpan={colSpan || 1}>
                {empty}
              </td>
            </tr>
          ) : (
            view.map(({ row, i }) => (
              <tr key={i} data-selected={selectable && selected.has(i) ? 'true' : undefined}>
                {selectable && (
                  <td style={{ ...tableCell, ...dataTableCheckboxCellStyle() }}>
                    <Check checked={selected.has(i)} onChange={() => toggleRow(i)} label={`Select row ${i + 1}`} />
                  </td>
                )}
                {visibleColumns.map((c) => (
                  <td key={c.key} style={{ ...tableCell, textAlign: c.align || 'left' }}>
                    {formatValue(row[c.key], c.format)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {selectable && selected.size > 0 && <div style={dataTableSelectionStyle()}>{selected.size} selected</div>}
    </div>
  )
}

registerBlockRenderer('data-table', DataTableView)
