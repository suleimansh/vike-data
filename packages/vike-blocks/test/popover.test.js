// The popover primitive's edge-aware placement math (resolvePlacement + popoverMaxHeight). These are
// the pure decisions the react + vue usePopover share: given the measured trigger + panel rects and the
// viewport, flip the side/align when the panel would overflow, and cap the panel height to the room in
// the chosen direction. The lifecycle (measuring, focus, outside-close) is DOM-only and lives in the
// renderers, verified live; this covers the geometry so the two twins can't drift.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolvePlacement, popoverMaxHeight, POPOVER_GAP } from '../blocks/popover-styles.js'

const VP = { width: 1000, height: 800 }
// A trigger rect helper (viewport coords).
const trig = (top, left, w = 120, h = 32) => ({ top, left, right: left + w, bottom: top + h, width: w, height: h })
const panel = (w, h) => ({ width: w, height: h })

test('keeps the requested placement when there is room', () => {
  assert.equal(resolvePlacement('bottom-start', trig(100, 100), panel(200, 250), VP), 'bottom-start')
  assert.equal(resolvePlacement('top-end', trig(500, 700), panel(200, 250), VP), 'top-end')
})

test('flips bottom -> top when the panel would overflow below and there is more room above', () => {
  // trigger near the bottom: only ~90px below, but ~700px above
  assert.equal(resolvePlacement('bottom-start', trig(710, 100), panel(200, 300), VP), 'top-start')
})

test('flips top -> bottom when there is not enough room above', () => {
  // trigger near the top: only ~40px above, plenty below
  assert.equal(resolvePlacement('top-start', trig(40, 100), panel(200, 300), VP), 'bottom-start')
})

test('does not flip when neither side fits but the requested side has more room', () => {
  // tall panel, trigger mid-screen: below (≈ 468) > above (≈ 300), so bottom stays
  assert.equal(resolvePlacement('bottom-start', trig(300, 100), panel(200, 900), VP), 'bottom-start')
})

test('flips align start -> end when the panel would overflow the right edge', () => {
  // trigger near the right edge, wide panel: left-anchored would run off the right
  assert.equal(resolvePlacement('bottom-start', trig(100, 900, 80), panel(300, 200), VP), 'bottom-end')
})

test('flips align end -> start when the panel would overflow the left edge', () => {
  // trigger near the left edge, wide panel: right-anchored would run off the left
  assert.equal(resolvePlacement('bottom-end', trig(100, 20, 80), panel(300, 200), VP), 'bottom-start')
})

test('side and align can both flip together', () => {
  assert.equal(resolvePlacement('bottom-start', trig(720, 900, 80), panel(300, 300), VP), 'top-end')
})

test('popoverMaxHeight is the room to the viewport edge in the chosen direction', () => {
  // bottom: viewport.height - trigger.bottom - gap - margin
  assert.equal(popoverMaxHeight('bottom-start', trig(100, 100), VP), 800 - 132 - POPOVER_GAP - 8)
  // top: trigger.top - gap - margin (trigger well down the page so the room clears the floor)
  assert.equal(popoverMaxHeight('top-start', trig(300, 100), VP), 300 - POPOVER_GAP - 8)
})

test('popoverMaxHeight never returns less than a usable floor', () => {
  const t = trig(795, 100) // almost at the bottom edge -> tiny room, clamped up
  assert.equal(popoverMaxHeight('bottom-start', t, VP), 96)
})
