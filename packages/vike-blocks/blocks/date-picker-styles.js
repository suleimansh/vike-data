// Shared, framework-agnostic styling + the display formatter for the `date-picker` block, imported by
// BOTH the react and vue renderers so the twins can't drift. The trigger is an input-like button; the
// panel motion + anchoring come from the popover primitive (popover-styles), and the grid itself is the
// calendar renderer, so this only owns the trigger look, its interactive states, and the label format.
import { MONTH_NAMES, parseYMD } from './calendar-styles.js'

// "Jul 4, 2026" from a 'YYYY-MM-DD' string, or the raw string if it isn't a real calendar day.
export function formatDisplay(iso) {
  const d = parseYMD(iso)
  if (!d) return iso ?? ''
  return `${MONTH_NAMES[d.monthIndex].slice(0, 3)} ${d.day}, ${d.year}`
}

// The input-like trigger box. `hasValue` dims the label to the muted color when it's still the
// placeholder, matching a real empty input.
export function datePickerTriggerStyle(hasValue) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.6rem',
    minWidth: '13rem',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--color-border, #e2e8f0)',
    borderRadius: 'var(--radius, 8px)',
    background: 'var(--color-bg, #ffffff)',
    color: hasValue ? 'var(--color-text, #0f172a)' : 'var(--color-muted, #64748b)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '14px',
    textAlign: 'left',
  }
}

// A feather-style calendar glyph for the trigger's trailing icon (a bare SVG path, theme-colored).
export const CALENDAR_ICON_PATH =
  'M8 2v3M16 2v3M3 9h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'

// Static <style> for the trigger's interactive states (a hover border + a focus-visible ring), on the
// shared class so both twins share one rule.
export const DATE_PICKER_STYLE_TAG =
  '.vike-blocks-datepicker:hover{border-color:var(--color-border-strong,var(--color-primary,#2563eb))}' +
  '.vike-blocks-datepicker:focus-visible{outline:none;border-color:var(--color-primary,#2563eb);box-shadow:0 0 0 3px var(--color-ring-soft,rgba(37,99,235,0.25))}'
