// The Vue renderer for the `calendar` block — the Vue twin of react/CalendarView.jsx, a dep-free,
// theme-native month grid. Prev/next step the displayed month; clicking a day selects it (and, if it's
// an adjacent-month day, jumps to that month). It tracks its own displayed month + selection (binding
// is the actions axis #385), so `value` is the INITIAL selection and SSR agrees with the first client
// render. Shares the grid math, range checks, and styles with the React renderer via calendar-styles.
import { h, ref } from 'vue'
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
} from '../calendar-styles.js'

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
export const CalendarView = {
  props: ['value', 'month', 'min', 'max', 'weekStartsOn', 'name', 'onSelect'],
  setup(props) {
    const selected = ref(props.value ?? null)
    const view = ref(initialView(props.month, props.value))

    return () => {
      const weekStartsOn = props.weekStartsOn === 1 ? 1 : 0
      const now = new Date()
      const todayIso = toISO(now.getFullYear(), now.getMonth(), now.getDate())
      const weeks = monthMatrix(view.value.year, view.value.monthIndex, weekStartsOn)

      const pick = (day) => {
        if (isDisabled(day.iso, props.min, props.max)) return
        selected.value = day.iso
        if (!day.inMonth) view.value = { year: day.year, monthIndex: day.monthIndex }
        props.onSelect?.(day.iso)
      }

      const header = h('div', { style: calendarHeaderStyle() }, [
        h(
          'button',
          {
            type: 'button',
            'aria-label': 'Previous month',
            class: 'vike-blocks-cal-nav',
            style: calendarNavStyle(),
            onClick: () => (view.value = addMonths(view.value.year, view.value.monthIndex, -1)),
          },
          '‹',
        ),
        h('span', { style: calendarTitleStyle() }, `${MONTH_NAMES[view.value.monthIndex]} ${view.value.year}`),
        h(
          'button',
          {
            type: 'button',
            'aria-label': 'Next month',
            class: 'vike-blocks-cal-nav',
            style: calendarNavStyle(),
            onClick: () => (view.value = addMonths(view.value.year, view.value.monthIndex, 1)),
          },
          '›',
        ),
      ])

      const weekdayCells = orderedWeekdays(weekStartsOn).map((w) => h('div', { key: w, style: calendarWeekdayStyle(), 'aria-hidden': 'true' }, w.slice(0, 2)))

      const dayCells = weeks.flat().map((day) => {
        const disabled = isDisabled(day.iso, props.min, props.max)
        const isSel = selected.value === day.iso
        return h(
          'button',
          {
            key: day.iso,
            type: 'button',
            role: 'gridcell',
            'aria-label': day.iso,
            'aria-selected': isSel,
            'aria-current': day.iso === todayIso ? 'date' : undefined,
            disabled: disabled || undefined,
            class: 'vike-blocks-cal-day',
            style: calendarDayStyle({ selected: isSel, outside: !day.inMonth, today: day.iso === todayIso, disabled }),
            onClick: () => pick(day),
          },
          String(day.day),
        )
      })

      return h('div', { style: calendarRootStyle(), 'data-slot': 'calendar' }, [
        h('style', CALENDAR_STYLE_TAG),
        props.name != null ? h('input', { type: 'hidden', name: props.name, value: selected.value ?? '' }) : null,
        header,
        h('div', { style: calendarGridStyle(), role: 'grid' }, [...weekdayCells, ...dayCells]),
      ])
    }
  },
}

registerBlockRenderer('calendar', CalendarView)
