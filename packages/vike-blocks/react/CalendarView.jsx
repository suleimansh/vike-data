// The React renderer for the `calendar` block — a dep-free, theme-native month grid. Prev/next step the
// displayed month; clicking a day selects it (and, if it's an adjacent-month day, jumps to that month).
// It tracks its own displayed month + selection (value binding is the actions axis #385), so `value` is
// the INITIAL selection and SSR agrees with the first client render. The grid math, range checks, and
// styles live in the shared calendar-styles module, so this stays a thin binding and can't drift from
// the Vue twin.
import { useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import {
  MONTH_NAMES,
  toISO,
  parseYMD,
  monthMatrix,
  addMonths,
  orderedWeekdays,
  isDisabled,
  calendarRootStyle,
  calendarHeaderStyle,
  calendarTitleStyle,
  calendarNavStyle,
  calendarGridStyle,
  calendarWeekdayStyle,
  calendarDayStyle,
  CALENDAR_STYLE_TAG,
} from '../blocks/calendar-styles.js'

// The month to show first: an explicit `month` ('YYYY-MM' or a full date), else the selected date's
// month, else today.
function initialView(month, value) {
  const ym = typeof month === 'string' && /^(\d{4})-(\d{2})$/.exec(month)
  if (ym) return { year: +ym[1], monthIndex: +ym[2] - 1 }
  const fromMonth = parseYMD(month)
  if (fromMonth) return { year: fromMonth.year, monthIndex: fromMonth.monthIndex }
  const fromValue = parseYMD(value)
  if (fromValue) return { year: fromValue.year, monthIndex: fromValue.monthIndex }
  const now = new Date()
  return { year: now.getFullYear(), monthIndex: now.getMonth() }
}

// `onSelect(iso)` (optional) fires when a day is picked, so a host like `date-picker` can reflect the
// selection in its trigger and close the popover; the grid still tracks its own selection for standalone use.
export function CalendarView({ value, month, min, max, weekStartsOn = 0, name, onSelect }) {
  const [selected, setSelected] = useState(value ?? null)
  const [view, setView] = useState(() => initialView(month, value))
  const now = new Date()
  const todayIso = toISO(now.getFullYear(), now.getMonth(), now.getDate())
  const weeks = monthMatrix(view.year, view.monthIndex, weekStartsOn)

  const pick = (day) => {
    if (isDisabled(day.iso, min, max)) return
    setSelected(day.iso)
    if (!day.inMonth) setView({ year: day.year, monthIndex: day.monthIndex })
    onSelect?.(day.iso)
  }

  return (
    <div style={calendarRootStyle()} data-slot="calendar">
      <style>{CALENDAR_STYLE_TAG}</style>
      {name != null && <input type="hidden" name={name} value={selected ?? ''} />}
      <div style={calendarHeaderStyle()}>
        <button type="button" aria-label="Previous month" className="vike-blocks-cal-nav" style={calendarNavStyle()} onClick={() => setView((v) => addMonths(v.year, v.monthIndex, -1))}>
          {'‹'}
        </button>
        <span style={calendarTitleStyle()}>
          {MONTH_NAMES[view.monthIndex]} {view.year}
        </span>
        <button type="button" aria-label="Next month" className="vike-blocks-cal-nav" style={calendarNavStyle()} onClick={() => setView((v) => addMonths(v.year, v.monthIndex, 1))}>
          {'›'}
        </button>
      </div>
      <div style={calendarGridStyle()} role="grid">
        {orderedWeekdays(weekStartsOn).map((w) => (
          <div key={w} style={calendarWeekdayStyle()} aria-hidden="true">
            {w.slice(0, 2)}
          </div>
        ))}
        {weeks.flat().map((day) => {
          const disabled = isDisabled(day.iso, min, max)
          const isSel = selected === day.iso
          return (
            <button
              key={day.iso}
              type="button"
              role="gridcell"
              aria-label={day.iso}
              aria-selected={isSel}
              aria-current={day.iso === todayIso ? 'date' : undefined}
              disabled={disabled}
              className="vike-blocks-cal-day"
              style={calendarDayStyle({ selected: isSel, outside: !day.inMonth, today: day.iso === todayIso, disabled })}
              onClick={() => pick(day)}
            >
              {day.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

registerBlockRenderer('calendar', CalendarView)
