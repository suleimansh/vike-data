// The `date-picker` block — a `calendar` in a popover, defined through the defineBlock seam. The
// trigger is an input-like button showing the selected date (or a placeholder); clicking it opens the
// month grid anchored below, and picking a day fills the trigger and closes. It carries the same
// calendar config: `date-picker(value)` (or `.value(...)`) is the initial selection ('YYYY-MM-DD');
// `.month('YYYY-MM')` the first shown month; `.min()` / `.max()` bound the range; `.weekStartsOn(0|1)`
// the first column; `.name()` sets the form field; `.placeholder()` the empty-state label. The renderer
// reuses the calendar renderer + the popover primitive, so the grid math lives in one place; date
// submit is the data/actions axis (#385).
//
//   datePicker('2026-07-15')
//   datePicker().min('2026-07-01').max('2026-07-31').placeholder('Due date')
//   datePicker().month('2026-07').weekStartsOn(1).name('due')
import { defineBlock } from '../core/registry.js'
import { calendarBuild, calendarRefine } from './_shared.js'

export const datePicker = defineBlock('date-picker', {
  build: calendarBuild,
  refine: {
    ...calendarRefine,
    placeholder: (p) => ({ placeholder: p }),
  },
})
