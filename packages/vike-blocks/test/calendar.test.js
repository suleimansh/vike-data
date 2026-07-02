// The calendar block: a dep-free, theme-native month grid (defineBlock, type 'calendar', builder
// `calendar`) with value / month / min / max / weekStartsOn / name refinements. The renderer is not
// node:test-tested (JSX/Vue stateful), so this covers the agnostic builder + resolve plus the shared
// date-math module (ISO parse, month matrix, month stepping, weekday order, range checks).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { calendar, field, definePage, resolvePage, hasBlock } from '../index.js'
import { parseYMD, toISO, addMonths, daysInMonth, monthMatrix, orderedWeekdays, isDisabled } from '../calendar-styles.js'

test('calendar is registered', () => {
  assert.ok(hasBlock('calendar'))
})

test('the builder collapses to a descriptor of type "calendar" (value optional)', () => {
  assert.deepEqual(calendar().build(), { block: 'calendar' })
  assert.deepEqual(calendar('2026-07-15').build(), { block: 'calendar', value: '2026-07-15' })
  assert.deepEqual(calendar().value('2026-07-04').min('2026-07-01').max('2026-07-31').weekStartsOn(1).name('due').build(), {
    block: 'calendar',
    value: '2026-07-04',
    min: '2026-07-01',
    max: '2026-07-31',
    weekStartsOn: 1,
    name: 'due',
  })
  assert.equal(calendar().weekStartsOn(3).build().weekStartsOn, 0) // only 0 or 1
})

test('resolves as a pass-through section and composes in a field', () => {
  const out = resolvePage(definePage({ sections: [calendar().value('2026-07-04')] }))
  assert.equal(out.sections[0].block, 'calendar')
  assert.deepEqual(out.sections[0].resolved, { value: '2026-07-04' })
  const wrapped = resolvePage(definePage({ sections: [field('Due').control(calendar().value('2026-07-04'))] }))
  assert.equal(wrapped.sections[0].resolved.control.block, 'calendar')
})

test('parseYMD accepts real days and rejects malformed / impossible ones', () => {
  assert.deepEqual(parseYMD('2026-07-04'), { year: 2026, monthIndex: 6, day: 4, iso: '2026-07-04' })
  assert.equal(parseYMD('2026-13-01'), null) // no month 13
  assert.equal(parseYMD('2026-02-30'), null) // Feb 30 rolls over
  assert.equal(parseYMD('2026-7-4'), null) // not zero-padded
  assert.equal(parseYMD(20260704), null)
})

test('toISO zero-pads and addMonths carries across years', () => {
  assert.equal(toISO(2026, 6, 4), '2026-07-04') // monthIndex 6 -> 07
  assert.deepEqual(addMonths(2026, 0, -1), { year: 2025, monthIndex: 11 }) // Jan -> prev Dec
  assert.deepEqual(addMonths(2026, 11, 1), { year: 2027, monthIndex: 0 }) // Dec -> next Jan
  assert.deepEqual(addMonths(2026, 5, 14), { year: 2027, monthIndex: 7 })
})

test('daysInMonth handles leap years', () => {
  assert.equal(daysInMonth(2024, 1), 29) // Feb 2024 (leap)
  assert.equal(daysInMonth(2026, 1), 28) // Feb 2026
  assert.equal(daysInMonth(2026, 3), 30) // April
})

test('monthMatrix builds whole weeks with adjacent-month fillers', () => {
  // July 2026: the 1st is a Wednesday; with a Sunday start the first row leads with Jun 28..Jul 4.
  const weeks = monthMatrix(2026, 6, 0)
  assert.ok(weeks.every((w) => w.length === 7)) // every row full
  assert.equal(weeks[0].length, 7)
  assert.equal(weeks[0][0].iso, '2026-06-28') // leading day from June
  assert.equal(weeks[0][0].inMonth, false)
  const jul1 = weeks.flat().find((c) => c.iso === '2026-07-01')
  assert.equal(jul1.inMonth, true)
  // 31 in-month days for July
  assert.equal(weeks.flat().filter((c) => c.inMonth).length, 31)
})

test('orderedWeekdays rotates with weekStartsOn; isDisabled respects min/max', () => {
  assert.deepEqual(orderedWeekdays(0).slice(0, 2), ['Sun', 'Mon'])
  assert.deepEqual(orderedWeekdays(1).slice(0, 2), ['Mon', 'Tue'])
  assert.equal(isDisabled('2026-06-30', '2026-07-01', undefined), true) // before min
  assert.equal(isDisabled('2026-08-01', undefined, '2026-07-31'), true) // after max
  assert.equal(isDisabled('2026-07-15', '2026-07-01', '2026-07-31'), false) // in range
})
