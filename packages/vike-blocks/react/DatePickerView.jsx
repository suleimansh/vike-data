// The React renderer for the `date-picker` block — a `calendar` in a popover. The trigger is an
// input-like button; opening it anchors the month grid below via the popover primitive, and picking a
// day (through the calendar's onSelect hook) fills the trigger and closes. It tracks its own selection
// (value binding is the actions axis #385), so `value` is the INITIAL selection and SSR renders only
// the trigger — the panel is client + open-gated, so there's no hydration mismatch. The grid math is
// the calendar renderer and the panel motion is the popover primitive, so this stays a thin binding.
import { useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.jsx'
import { CalendarView } from './CalendarView.jsx'
import { popoverMotionStyle } from '../popover-styles.js'
import { formatDisplay, datePickerTriggerStyle, CALENDAR_ICON_PATH, DATE_PICKER_STYLE_TAG } from '../date-picker-styles.js'

export function DatePickerView({ value, month, min, max, weekStartsOn = 0, name, placeholder = 'Pick a date' }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(value ?? null)
  const label = selected ? formatDisplay(selected) : placeholder

  const trigger = (
    <>
      <style>{DATE_PICKER_STYLE_TAG}</style>
      {name != null && <input type="hidden" name={name} value={selected ?? ''} />}
      <button
        type="button"
        className="vike-blocks-datepicker"
        aria-haspopup="dialog"
        aria-expanded={open}
        style={datePickerTriggerStyle(!!selected)}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={CALENDAR_ICON_PATH} />
        </svg>
      </button>
    </>
  )

  return (
    <Popover open={open} onClose={() => setOpen(false)} trigger={trigger} placement="bottom-start" panelStyle={(v) => popoverMotionStyle(v, 'bottom-start')}>
      <CalendarView
        value={selected ?? value}
        month={month}
        min={min}
        max={max}
        weekStartsOn={weekStartsOn}
        onSelect={(iso) => {
          setSelected(iso)
          setOpen(false)
        }}
      />
    </Popover>
  )
}

registerBlockRenderer('date-picker', DatePickerView)
