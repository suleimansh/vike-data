// The `calendar` block — a month grid for date selection, defined through the defineBlock seam.
// `calendar(value)` (or `.value(...)`) is the INITIAL selected date ('YYYY-MM-DD'); `.month('YYYY-MM')`
// sets the initially displayed month (defaults to the selected date's month, else today); `.min()` /
// `.max()` bound the selectable range; `.weekStartsOn(0|1)` picks the first column (0=Sunday, default);
// `.name()` sets a form field. The renderer tracks its own displayed month + selection (local UI state,
// like slider/switch); the actual date submit is the data/actions axis (#385). Feeds `date-picker`.
//
//   calendar('2026-07-15')
//   calendar().value('2026-07-04').min('2026-07-01').max('2026-07-31')
//   calendar().month('2026-07').weekStartsOn(1)
import { defineBlock } from '../core/registry.js'
import { calendarBuild, calendarRefine } from './_shared.js'

export const calendar = defineBlock('calendar', {
  build: calendarBuild,
  refine: calendarRefine,
})
