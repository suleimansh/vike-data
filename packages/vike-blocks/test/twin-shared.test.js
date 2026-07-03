// The pure helpers hoisted out of the react/vue view twins so the two frameworks share one
// implementation (issue #548 Section 1). Exercised directly here.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isNav, stackRegionOrder } from '../core/view-helpers.js'
import { FOCUSABLE } from '../core/overlay-motion.js'
import { POPOVER_FOCUSABLE } from '../blocks/popover-styles.js'
import { initialView } from '../blocks/calendar-styles.js'
import { toastDeckOffsets } from '../blocks/toast-styles.js'
import { paginationEdgeStyle, paginationLinkStyle } from '../blocks/pagination-styles.js'

test('isNav: array of link-ish items only', () => {
  assert.equal(isNav([{ href: '/a' }, { label: 'B' }]), true)
  assert.equal(isNav([{ href: '/a' }, { nope: 1 }]), false)
  assert.equal(isNav([]), true) // vacuously; every() on empty is true (matches prior twin behavior)
  assert.equal(isNav('nav'), false)
  assert.equal(isNav(null), false)
})

test('stackRegionOrder: header/main/footer first (when present), then extras in order', () => {
  assert.deepEqual(stackRegionOrder({ footer: 1, main: 1, header: 1 }), ['header', 'main', 'footer'])
  assert.deepEqual(stackRegionOrder({ aside: 1, main: 1 }), ['main', 'aside'])
  assert.deepEqual(stackRegionOrder({ main: 1 }), ['main'])
})

test('FOCUSABLE and POPOVER_FOCUSABLE are the one shared selector', () => {
  assert.equal(POPOVER_FOCUSABLE, FOCUSABLE)
  assert.ok(FOCUSABLE.includes('a[href]'))
})

test('initialView: explicit month wins, else value month, else today', () => {
  assert.deepEqual(initialView('2026-03', undefined), { year: 2026, monthIndex: 2 })
  assert.deepEqual(initialView(undefined, '2026-07-04'), { year: 2026, monthIndex: 6 })
  const now = new Date()
  assert.deepEqual(initialView(undefined, undefined), { year: now.getFullYear(), monthIndex: now.getMonth() })
})

test('toastDeckOffsets: prefix sum of height + gap in front of each toast', () => {
  const ordered = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
  const hOf = () => 50
  assert.deepEqual(toastDeckOffsets(ordered, hOf, 10), [0, 60, 120])
  assert.deepEqual(toastDeckOffsets([], hOf, 10), [])
})

test('paginationEdgeStyle / paginationLinkStyle return style objects', () => {
  assert.equal(typeof paginationEdgeStyle(false), 'object')
  assert.equal(paginationEdgeStyle(true).cursor, 'default') // dimmed when disabled
  assert.equal(typeof paginationLinkStyle(true), 'object')
})
