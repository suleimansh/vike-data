// The React renderer for a `list` block — a table over the derived columns. Standalone it just
// draws columns + rows; it also carries the options a full admin list needs, so vike-admin
// renders its list THROUGH this one component instead of a second table:
//   - `fkLabels` ({ col: { value: label } }) shows a FK cell's referenced title instead of the key
//   - `sort`/`dir`/`sortHref(col, nextDir)` make the marked-sortable headers into sort links
//   - `rowHref(row)` adds a trailing actions column linking each row (e.g. to its edit page)
//   - `rowActions(row)` renders extra per-row controls in that same actions column (e.g. a
//     Delete form) — the caller owns the markup, so it can be a no-JS form or any node
// All optional, so a bare `<ListView columns rows />` still works. `rows` default to none (the
// data layer supplies them), so with none it shows the columns and an empty state.
import './widgets.jsx' // side-effect: registers the built-in widgets (and any app slot registers alongside)
import { getFieldWidget } from './widget-registry.js'
import { formatValue } from '../list-format.js'

const cell = { padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--color-border)', textAlign: 'left', fontSize: 14 }
const th = { ...cell, color: 'var(--color-muted)', fontWeight: 600 }

export function ListView({
  table,
  columns = [],
  rows = [],
  pk = 'id',
  fkLabels,
  sort,
  dir,
  sortHref,
  rowHref,
  rowActions,
  rowActionLabel = 'Edit',
  emptyLabel = 'No rows.',
}) {
  const hasActions = typeof rowHref === 'function' || typeof rowActions === 'function'

  // A sortable header links to the same list sorted by its column; the active column flips
  // direction and shows an arrow. Only when the column is sortable AND a sortHref is supplied.
  function header(c) {
    if (!c.sortable || typeof sortHref !== 'function') return c.label
    const active = sort === c.name
    const nextDir = active && dir === 'asc' ? 'desc' : 'asc'
    const arrow = active ? (dir === 'asc' ? ' ↑' : ' ↓') : ''
    return (
      <a href={sortHref(c.name, nextDir)} style={{ color: 'inherit', textDecoration: 'none' }}>
        {c.label}
        {arrow}
      </a>
    )
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }} data-table={table}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.name} style={th}>{header(c)}</th>
          ))}
          {hasActions && <th style={{ ...th, width: 1 }} />}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td style={{ ...cell, color: 'var(--color-muted)' }} colSpan={columns.length + (hasActions ? 1 : 0) || 1}>
              {emptyLabel}
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={row[pk] ?? i}>
              {columns.map((c) => {
                // A slot override (tier 2) renders the app's registered cell component with
                // `{ field, value, row }`; an unregistered token falls back to the derived cell.
                const Slot = c.slot ? getFieldWidget(c.slot) : null
                return (
                  <td key={c.name} style={cell}>
                    {Slot ? <Slot field={c} value={row[c.name]} row={row} /> : (fkLabels?.[c.name]?.[row[c.name]] ?? formatValue(row[c.name], c.format))}
                  </td>
                )
              })}
              {hasActions && (
                <td style={{ ...cell, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {typeof rowHref === 'function' && (
                      <a href={rowHref(row)} style={{ color: 'var(--color-primary)', fontSize: 14 }}>{rowActionLabel}</a>
                    )}
                    {typeof rowActions === 'function' ? rowActions(row) : null}
                  </span>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
