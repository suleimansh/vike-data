// Framework-agnostic cell formatting shared by the React and Vue ListView twins, so the two
// renderers can't drift. Pure functions, no framework imports.

// A relative "3 days ago" string for a date-ish value; unparseable values pass through as text.
export function relativeTime(value) {
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

// The one place a boolean renders as text, shared by the list cell and the record field so the
// two twins can't drift (list read lowercase, record read Yes/No before this).
export const booleanLabel = (value) => (value ? 'Yes' : 'No')

// A named client-side formatter token -> a display transform; booleans read Yes/No. Unknown
// tokens render the raw value.
export function formatValue(value, format) {
  if (value == null) return ''
  if (format === 'since') return relativeTime(value)
  if (typeof value === 'boolean') return booleanLabel(value)
  return String(value)
}
