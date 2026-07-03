// Shared, framework-agnostic positioning + motion for the popover primitive, imported by BOTH the
// react and vue twins so they can't drift. The popover is the LIGHT sibling of the overlay primitive
// (react/overlay.jsx): no backdrop, no scroll-lock, no focus trap — just a panel anchored to its
// trigger that closes on outside-click or Escape. It's the machinery the anchored surfaces reuse
// (date-picker first, then dropdown-menu / nav-menu). The panel is a `position:absolute` child of a
// `position:relative` wrapper around the trigger, so no portal + no coordinate math is needed; it
// follows the trigger for free and stays dep-free. Consumers whose content brings its own box (the
// calendar in a date-picker) pass `popoverMotionStyle`; menu-style consumers add `popoverSurfaceStyle`.

// The tab-order selector for the elements a popover focuses on open — the same set the overlay uses,
// sourced from the one shared const so the two can't drift.
import { FOCUSABLE } from '../core/overlay-motion.js'
export const POPOVER_FOCUSABLE = FOCUSABLE

// A popover is snappier than a modal: a short decelerating enter, no overshoot.
export const POPOVER_ENTER_MS = 160
export const POPOVER_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
export const POPOVER_GAP = 6 // px between the trigger and the panel
const VIEWPORT_MARGIN = 8 // px the panel keeps from the viewport edge when capping its height

// Where the panel sits relative to the trigger wrapper. `placement` is `<side>-<align>`:
// side = top | bottom (default bottom), align = start | end (default start). The wrapper is
// `position:relative`, so these are edges of the trigger box.
export function popoverAnchorStyle(placement = 'bottom-start') {
  const [side, align = 'start'] = String(placement).split('-')
  const style = { position: 'absolute', zIndex: 50 }
  if (side === 'top') {
    style.bottom = '100%'
    style.marginBottom = `${POPOVER_GAP}px`
  } else {
    style.top = '100%'
    style.marginTop = `${POPOVER_GAP}px`
  }
  if (align === 'end') style.right = 0
  else style.left = 0
  return style
}

// The bare enter/exit motion for a popover panel: fade + a small slide + a subtle scale from the
// anchored corner (so it grows out of the trigger, matching the shadcn/Radix feel). Used by consumers
// whose content already draws its own surface (e.g. the calendar), so the primitive stays unstyled
// beyond position + motion, mirroring how the overlay leaves the panel box to the consumer.
export function popoverMotionStyle(visible, placement = 'bottom-start') {
  const [side, align = 'start'] = String(placement).split('-')
  const fromY = side === 'top' ? 6 : -6
  const originY = side === 'top' ? 'bottom' : 'top'
  const originX = align === 'end' ? 'right' : 'left'
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0) scale(1)' : `translateY(${fromY}px) scale(0.96)`,
    transformOrigin: `${originX} ${originY}`,
    transition: `opacity ${POPOVER_ENTER_MS}ms ease, transform ${POPOVER_ENTER_MS}ms ${POPOVER_EASE}`,
  }
}

// Edge-aware placement: given the requested placement and the measured trigger + panel rects (viewport
// coords) and the viewport size, flip the side (bottom<->top) and/or align (start<->end) when the panel
// would overflow, but only if the opposite side/align actually has more room. Pure, so the react + vue
// primitives share one decision and unit tests can cover it.
export function resolvePlacement(requested, trigger, panel, viewport) {
  let [side, align = 'start'] = String(requested).split('-')
  const needV = panel.height + POPOVER_GAP
  const below = viewport.height - trigger.bottom
  const above = trigger.top
  if (side === 'bottom' && below < needV && above > below) side = 'top'
  else if (side === 'top' && above < needV && below > above) side = 'bottom'

  // start = anchored to the trigger's left edge (panel grows right); end = anchored right (grows left).
  const overflowsRight = trigger.left + panel.width > viewport.width - POPOVER_GAP
  const overflowsLeft = trigger.right - panel.width < POPOVER_GAP
  if (align === 'start' && overflowsRight && !overflowsLeft) align = 'end'
  else if (align === 'end' && overflowsLeft && !overflowsRight) align = 'start'

  return `${side}-${align}`
}

// The px the panel may grow to in the chosen direction before it would run off-screen, so a long menu
// scrolls instead of overflowing. Never returns less than a small floor (so it stays usable on a tiny
// viewport).
export function popoverMaxHeight(placement, trigger, viewport) {
  const side = String(placement).split('-')[0]
  const room = side === 'top' ? trigger.top : viewport.height - trigger.bottom
  return Math.max(96, room - POPOVER_GAP - VIEWPORT_MARGIN)
}

// A default menu-style surface box (border + elevation + radius), for consumers whose content does NOT
// bring its own box (dropdown-menu / nav-menu land here). Compose with popoverMotionStyle.
export function popoverSurfaceStyle() {
  return {
    minWidth: '10rem',
    padding: '0.35rem',
    border: '1px solid var(--color-border, #e2e8f0)',
    borderRadius: 'var(--radius, 10px)',
    background: 'var(--color-bg, #ffffff)',
    color: 'var(--color-text, #0f172a)',
    boxShadow: '0 10px 30px -12px rgba(15, 23, 42, 0.35)',
    font: 'inherit',
    fontSize: '14px',
  }
}
