// The date-picker block: a calendar in a popover (defineBlock, type 'date-picker', builder
// `datePicker`) with value / month / min / max / weekStartsOn / name / placeholder refinements. The
// renderers are not node:test-tested (JSX/Vue stateful + DOM-only popover), so this covers the agnostic
// builder + resolve, the display formatter, and the shared popover-positioning module (anchor edges +
// enter/exit motion) that the dropdown/nav menus will reuse.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { datePicker, field, definePage, resolvePage, hasBlock } from '../index.js'
import { formatDisplay } from '../date-picker-styles.js'
import { popoverAnchorStyle, popoverMotionStyle, popoverSurfaceStyle, POPOVER_ENTER_MS } from '../popover-styles.js'

test('date-picker is registered', () => {
  assert.ok(hasBlock('date-picker'))
})

test('the builder collapses to a descriptor of type "date-picker" (value optional)', () => {
  assert.deepEqual(datePicker().build(), { block: 'date-picker' })
  assert.deepEqual(datePicker('2026-07-15').build(), { block: 'date-picker', value: '2026-07-15' })
  assert.deepEqual(
    datePicker().value('2026-07-04').min('2026-07-01').max('2026-07-31').weekStartsOn(1).name('due').placeholder('Due date').build(),
    { block: 'date-picker', value: '2026-07-04', min: '2026-07-01', max: '2026-07-31', weekStartsOn: 1, name: 'due', placeholder: 'Due date' },
  )
  assert.equal(datePicker().weekStartsOn(3).build().weekStartsOn, 0) // only 0 or 1
  assert.equal(datePicker().month('2026-07').build().month, '2026-07')
})

test('resolves as a pass-through section and composes in a field', () => {
  const out = resolvePage(definePage({ sections: [datePicker().value('2026-07-04')] }))
  assert.equal(out.sections[0].block, 'date-picker')
  assert.deepEqual(out.sections[0].resolved, { value: '2026-07-04' })
  const wrapped = resolvePage(definePage({ sections: [field('Due').control(datePicker().value('2026-07-04'))] }))
  assert.equal(wrapped.sections[0].resolved.control.block, 'date-picker')
})

test('formatDisplay renders a friendly label and passes bad input through', () => {
  assert.equal(formatDisplay('2026-07-04'), 'Jul 4, 2026')
  assert.equal(formatDisplay('2026-12-25'), 'Dec 25, 2026')
  assert.equal(formatDisplay('2026-02-30'), '2026-02-30') // not a real day -> raw string
  assert.equal(formatDisplay(''), '')
  assert.equal(formatDisplay(undefined), '')
})

test('popoverAnchorStyle places the panel on the right side/align of the trigger', () => {
  const below = popoverAnchorStyle('bottom-start')
  assert.equal(below.position, 'absolute')
  assert.equal(below.top, '100%')
  assert.equal(below.left, 0)
  assert.equal(below.right, undefined)

  const aboveEnd = popoverAnchorStyle('top-end')
  assert.equal(aboveEnd.bottom, '100%')
  assert.equal(aboveEnd.right, 0)
  assert.equal(aboveEnd.left, undefined)

  // bare side defaults align to start
  assert.equal(popoverAnchorStyle('bottom').left, 0)
  // no argument -> bottom-start
  assert.equal(popoverAnchorStyle().top, '100%')
})

test('popoverMotionStyle drives opacity + a directional slide by visibility', () => {
  const hidden = popoverMotionStyle(false, 'bottom-start')
  assert.equal(hidden.opacity, 0)
  assert.equal(hidden.transform, 'translateY(-6px) scale(0.96)') // slides + scales up from the trigger
  assert.equal(hidden.transformOrigin, 'left top') // grows out of the anchored corner
  assert.match(hidden.transition, new RegExp(`${POPOVER_ENTER_MS}ms`))

  const shown = popoverMotionStyle(true, 'bottom-start')
  assert.equal(shown.opacity, 1)
  assert.equal(shown.transform, 'translateY(0) scale(1)')

  // a top-anchored panel slides the other way and grows from its bottom edge
  assert.equal(popoverMotionStyle(false, 'top-start').transform, 'translateY(6px) scale(0.96)')
  assert.equal(popoverMotionStyle(false, 'top-end').transformOrigin, 'right bottom')
})

test('popoverSurfaceStyle is a themed menu box', () => {
  const s = popoverSurfaceStyle()
  assert.match(s.background, /--color-bg/)
  assert.match(s.border, /--color-border/)
  assert.ok(s.boxShadow)
})
