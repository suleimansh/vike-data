// The Vue renderer for the `date-picker` block — the Vue twin of react/DatePickerView.jsx, a `calendar`
// in a popover. The trigger is an input-like button; opening it anchors the month grid below via the
// popover primitive, and picking a day (through the calendar's onSelect hook) fills the trigger and
// closes. It tracks its own selection (binding is the actions axis #385), so `value` is the INITIAL
// selection and SSR renders only the trigger — the panel is client + open-gated, no hydration mismatch.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.js'
import { CalendarView } from './CalendarView.js'
import { popoverMotionStyle } from '../blocks/popover-styles.js'
import { formatDisplay, datePickerTriggerStyle, CALENDAR_ICON_PATH, DATE_PICKER_STYLE_TAG } from '../blocks/date-picker-styles.js'

export const DatePickerView = {
  props: ['value', 'month', 'min', 'max', 'weekStartsOn', 'name', 'placeholder'],
  setup(props) {
    const open = ref(false)
    const selected = ref(props.value ?? null)

    return () => {
      const placeholder = props.placeholder ?? 'Pick a date'
      const label = selected.value ? formatDisplay(selected.value) : placeholder

      const trigger = h('span', { style: { display: 'contents' } }, [
        h('style', DATE_PICKER_STYLE_TAG),
        props.name != null ? h('input', { type: 'hidden', name: props.name, value: selected.value ?? '' }) : null,
        h(
          'button',
          {
            type: 'button',
            class: 'vike-blocks-datepicker',
            'aria-haspopup': 'dialog',
            'aria-expanded': open.value,
            style: datePickerTriggerStyle(!!selected.value),
            onClick: () => (open.value = !open.value),
          },
          [
            h('span', label),
            h(
              'svg',
              { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
              [h('path', { d: CALENDAR_ICON_PATH })],
            ),
          ],
        ),
      ])

      return h(
        Popover,
        {
          open: open.value,
          onClose: () => (open.value = false),
          trigger,
          placement: 'bottom-start',
          panelStyle: (v, pl) => popoverMotionStyle(v, pl),
        },
        {
          default: () =>
            h(CalendarView, {
              value: selected.value ?? props.value,
              month: props.month,
              min: props.min,
              max: props.max,
              weekStartsOn: props.weekStartsOn,
              onSelect: (iso) => {
                selected.value = iso
                open.value = false
              },
            }),
        },
      )
    }
  },
}

registerBlockRenderer('date-picker', DatePickerView)
