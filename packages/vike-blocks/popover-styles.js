// Shared, framework-agnostic positioning + motion for the popover primitive, imported by BOTH the
// react and vue twins so they can't drift. The popover is the LIGHT sibling of the overlay primitive
// (react/overlay.jsx): no backdrop, no scroll-lock, no focus trap — just a panel anchored to its
// trigger that closes on outside-click or Escape. It's the machinery the anchored surfaces reuse
// (date-picker first, then dropdown-menu / nav-menu). The panel is a `position:absolute` child of a
// `position:relative` wrapper around the trigger, so no portal + no coordinate math is needed; it
// follows the trigger for free and stays dep-free. Consumers whose content brings its own box (the
// calendar in a date-picker) pass `popoverMotionStyle`; menu-style consumers add `popoverSurfaceStyle`.

// The tab-order selector for the elements a popover focuses on open (shared with the overlay).
export const POPOVER_FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

// A popover is snappier than a modal: a short decelerating enter, no overshoot.
export const POPOVER_ENTER_MS = 160
export const POPOVER_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
const GAP = '6px' // the space between the trigger and the panel

// Where the panel sits relative to the trigger wrapper. `placement` is `<side>-<align>`:
// side = top | bottom (default bottom), align = start | end (default start). The wrapper is
// `position:relative`, so these are edges of the trigger box.
export function popoverAnchorStyle(placement = 'bottom-start') {
  const [side, align = 'start'] = String(placement).split('-')
  const style = { position: 'absolute', zIndex: 50 }
  if (side === 'top') {
    style.bottom = '100%'
    style.marginBottom = GAP
  } else {
    style.top = '100%'
    style.marginTop = GAP
  }
  if (align === 'end') style.right = 0
  else style.left = 0
  return style
}

// The bare enter/exit motion for a popover panel: fade + a small directional slide from the trigger
// edge. Used by consumers whose content already draws its own surface (e.g. the calendar), so the
// primitive stays unstyled beyond position + motion, mirroring how the overlay leaves the panel box
// to the consumer.
export function popoverMotionStyle(visible, placement = 'bottom-start') {
  const side = String(placement).split('-')[0]
  const from = side === 'top' ? 'translateY(4px)' : 'translateY(-4px)'
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : from,
    transformOrigin: side === 'top' ? 'bottom' : 'top',
    transition: `opacity ${POPOVER_ENTER_MS}ms ease, transform ${POPOVER_ENTER_MS}ms ${POPOVER_EASE}`,
  }
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
