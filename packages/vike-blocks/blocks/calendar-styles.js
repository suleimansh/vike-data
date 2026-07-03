// Shared, framework-agnostic date math + styles for the `calendar` block, imported by BOTH the react
// and vue renderers so the two twins can't drift. Dep-free (no date library) and theme-native. Dates
// are plain 'YYYY-MM-DD' strings, which sort lexicographically in date order, so range checks are just
// string compares. The month grid always fills whole weeks (leading/trailing days come from the
// adjacent months), matching the shadcn Base calendar.

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
export const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad2 = (n) => (n < 10 ? '0' + n : '' + n)

// A 0-based (year, monthIndex, day) as an ISO 'YYYY-MM-DD' string.
export const toISO = (year, monthIndex, day) => `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`

// Parse a strict 'YYYY-MM-DD' into its parts, or null if malformed / not a real calendar day.
export function parseYMD(str) {
  if (typeof str !== 'string') return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str)
  if (!m) return null
  const year = +m[1]
  const monthIndex = +m[2] - 1
  const day = +m[3]
  const dt = new Date(year, monthIndex, day)
  if (dt.getFullYear() !== year || dt.getMonth() !== monthIndex || dt.getDate() !== day) return null // e.g. Feb 30
  return { year, monthIndex, day, iso: str }
}

// The month to show first: an explicit `month` ('YYYY-MM' or a full date), else the selected date's
// month, else today. Shared by both renderers so the "which month opens" rule can't drift.
export function initialView(month, value) {
  const ym = typeof month === 'string' && /^(\d{4})-(\d{2})$/.exec(month)
  if (ym) return { year: +ym[1], monthIndex: +ym[2] - 1 }
  const fromMonth = parseYMD(month)
  if (fromMonth) return { year: fromMonth.year, monthIndex: fromMonth.monthIndex }
  const fromValue = parseYMD(value)
  if (fromValue) return { year: fromValue.year, monthIndex: fromValue.monthIndex }
  const now = new Date()
  return { year: now.getFullYear(), monthIndex: now.getMonth() }
}

export const daysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate()

// Shift a (year, monthIndex) by whole months, carrying across year boundaries in both directions.
export function addMonths(year, monthIndex, delta) {
  const total = year * 12 + monthIndex + delta
  return { year: Math.floor(total / 12), monthIndex: ((total % 12) + 12) % 12 }
}

const cell = (year, monthIndex, day, inMonth) => ({ year, monthIndex, day, iso: toISO(year, monthIndex, day), inMonth })

// The weeks (arrays of 7 day-cells) that make up a month's grid, including the leading days from the
// previous month and the trailing days from the next so every row is full. `weekStartsOn` is 0=Sunday.
export function monthMatrix(year, monthIndex, weekStartsOn = 0) {
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const lead = (firstWeekday - weekStartsOn + 7) % 7
  const cells = []
  const prev = addMonths(year, monthIndex, -1)
  const prevDim = daysInMonth(prev.year, prev.monthIndex)
  for (let i = lead - 1; i >= 0; i--) cells.push(cell(prev.year, prev.monthIndex, prevDim - i, false))
  const dim = daysInMonth(year, monthIndex)
  for (let d = 1; d <= dim; d++) cells.push(cell(year, monthIndex, d, true))
  const next = addMonths(year, monthIndex, 1)
  let nd = 1
  while (cells.length % 7 !== 0) cells.push(cell(next.year, next.monthIndex, nd++, false))
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

// The two-letter weekday labels in display order.
export const orderedWeekdays = (weekStartsOn = 0) => Array.from({ length: 7 }, (_, i) => WEEKDAY_NAMES[(weekStartsOn + i) % 7])

// A day is out of range when it falls before `min` or after `max` (ISO strings compare in date order).
export const isDisabled = (iso, min, max) => (!!min && iso < min) || (!!max && iso > max)

// --- styles ---

export const calendarRootStyle = () => ({
  display: 'inline-block',
  padding: '0.85rem',
  border: '1px solid var(--color-border, #e2e8f0)',
  borderRadius: 'var(--radius, 12px)',
  background: 'var(--color-bg, #ffffff)',
  color: 'var(--color-text, #0f172a)',
  font: 'inherit',
  fontSize: '14px',
})

export const calendarHeaderStyle = () => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' })
export const calendarTitleStyle = () => ({ fontWeight: 600 })

export const calendarNavStyle = () => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.75rem',
  height: '1.75rem',
  padding: 0,
  border: '1px solid var(--color-border, #e2e8f0)',
  borderRadius: 'var(--radius, 8px)',
  background: 'transparent',
  color: 'var(--color-text, #0f172a)',
  cursor: 'pointer',
  font: 'inherit',
  fontSize: '15px',
  lineHeight: 1,
})

export const calendarGridStyle = () => ({ display: 'grid', gridTemplateColumns: 'repeat(7, 2rem)', gap: '2px' })
export const calendarWeekdayStyle = () => ({ textAlign: 'center', fontSize: '12px', color: 'var(--color-muted, #64748b)', padding: '0.25rem 0' })

// One day cell. Selected fills with the primary color; today gets a ring; outside-month days and
// out-of-range days are dimmed (out-of-range is also disabled).
export function calendarDayStyle({ selected, outside, today, disabled }) {
  return {
    width: '2rem',
    height: '2rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 0,
    borderRadius: '999px',
    background: selected ? 'var(--color-primary, #2563eb)' : 'transparent',
    color: selected ? 'var(--color-primary-contrast, #ffffff)' : outside ? 'var(--color-muted, #94a3b8)' : 'var(--color-text, #0f172a)',
    boxShadow: today && !selected ? 'inset 0 0 0 1px var(--color-primary, #2563eb)' : 'none',
    fontWeight: selected ? 600 : 400,
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    font: 'inherit',
    fontSize: '13px',
  }
}

// Static <style> for the interactive states: a hover fill on selectable days and a focus-visible ring.
export const CALENDAR_STYLE_TAG =
  '.vike-blocks-cal-day:not(:disabled):not([aria-selected="true"]):hover{background:var(--color-surface,#f1f5f9)}' +
  '.vike-blocks-cal-day:focus-visible{outline:none;box-shadow:0 0 0 2px var(--color-bg,#fff),0 0 0 4px var(--color-ring,var(--color-primary,#2563eb))}' +
  '.vike-blocks-cal-nav:hover{background:var(--color-surface,#f1f5f9)}'
