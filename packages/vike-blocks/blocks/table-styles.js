// Shared chrome for the `table` block renderers (the React + Vue twins), mirroring vike-crud's
// ListView so a non-schema table themes identically. Cell/header styles read the `var(--color-*)`
// contract; formatValue mirrors ListView's named formatters; compareRows is the client-side sort
// comparator. Kept in one module so the two renderers can't drift.

export const tableCell = { padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--color-border, #e2e8f0)', textAlign: 'left', fontSize: 14 }
export const tableHeader = { ...tableCell, color: 'var(--color-muted, #64748b)', fontWeight: 600 }

// A row key -> a human label: split snake/kebab/camelCase into words and title-case them. Shared by
// the `table` and `data-table` blocks so column labels humanize identically.
export const humanize = (key) =>
  String(key)
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())

// Normalize a column spec (a string row-key, or an object with any of { key, label, align, format })
// to a full { key, label, align, format }. Shared by `table` and `data-table`.
export const normalizeColumn = (c) => {
  if (typeof c === 'string') return { key: c, label: humanize(c), align: 'left', format: null }
  const key = c?.key
  return { key, label: c?.label ?? humanize(key), align: c?.align ?? 'left', format: c?.format ?? null }
}

// Does a row match a free-text query across the given columns? Compares the FORMATTED cell values
// (case-insensitive substring) so a search matches what the user sees (e.g. "yes" for a boolean, the
// relative time for a `since` column). Pure, so the react + vue data-table renderers share it.
export function rowMatchesQuery(row, columns, query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return true
  return columns.some((c) => formatValue(row?.[c.key], c.format).toLowerCase().includes(q))
}

// A coarse "N units ago" for the `since` formatter — no date lib, mirrors ListView.
function relativeTime(value) {
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return String(value)
  const secs = Math.round((Date.now() - then) / 1000)
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [name, size] of units) {
    const n = Math.floor(secs / size)
    if (n >= 1) return `${n} ${name}${n > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

// A named client-side formatter token -> a display transform; booleans read yes/no; null/undefined
// render blank. Unknown tokens render the raw value. Mirrors ListView.formatValue.
export function formatValue(value, format) {
  if (value == null) return ''
  if (format === 'since') return relativeTime(value)
  if (typeof value === 'boolean') return value ? 'yes' : 'no'
  return String(value)
}

// Compare two rows on a column for client-side sorting: numbers numerically, everything else as
// strings (locale-aware); null/undefined always sort last regardless of direction.
export function compareRows(a, b, key, dir) {
  const av = a?.[key]
  const bv = b?.[key]
  if (av == null && bv == null) return 0
  if (av == null) return 1
  if (bv == null) return -1
  const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))
  return dir === 'desc' ? -cmp : cmp
}
