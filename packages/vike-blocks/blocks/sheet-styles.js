// Shared, framework-agnostic geometry for the `sheet` block, imported by BOTH the react and vue
// renderers so the two twins can't drift. Given an anchored edge, it produces (a) where the panel sits
// within the backdrop and (b) the panel box + the slide-in transform. Dep-free, theme-native. The
// slide duration must match the overlay primitive's ENTER_MS so the panel finishes sliding before the
// primitive unmounts it — so both come from the one shared overlay-motion source (drawer reuses these).
import { OVERLAY_ENTER_MS, OVERLAY_EASE } from '../core/overlay-motion.js'
export const SHEET_ENTER_MS = OVERLAY_ENTER_MS
// A decelerate ease (no overshoot) — a full-edge panel that overshot would flash a gap past the edge.
export const SHEET_EASE = OVERLAY_EASE

// Only the two inner corners are rounded; the anchored edge stays flush.
const RADIUS = {
  right: '12px 0 0 12px',
  left: '0 12px 12px 0',
  top: '0 0 12px 12px',
  bottom: '12px 12px 0 0',
}

const isVertical = (side) => side === 'top' || side === 'bottom'
const norm = (side) => (RADIUS[side] ? side : 'right')

// Where the panel sits within the backdrop, by anchored edge (fed to the overlay's containerStyle).
export function sheetContainerStyle(side) {
  switch (norm(side)) {
    case 'left':
      return { alignItems: 'stretch', justifyContent: 'flex-start' }
    case 'top':
      return { alignItems: 'flex-start', justifyContent: 'stretch' }
    case 'bottom':
      return { alignItems: 'flex-end', justifyContent: 'stretch' }
    case 'right':
    default:
      return { alignItems: 'stretch', justifyContent: 'flex-end' }
  }
}

// The hidden-state transform the panel slides in FROM (fully off its anchored edge).
export function sheetHiddenTransform(side) {
  switch (norm(side)) {
    case 'left':
      return 'translateX(-100%)'
    case 'top':
      return 'translateY(-100%)'
    case 'bottom':
      return 'translateY(100%)'
    case 'right':
    default:
      return 'translateX(100%)'
  }
}

// The panel box + slide transform. Vertical (top/bottom) panels are full-width and height-capped;
// horizontal (left/right) panels are full-height and width-capped.
export function sheetPanelStyle(side, visible) {
  const s = norm(side)
  const vertical = isVertical(s)
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    boxSizing: 'border-box',
    padding: '1.25rem',
    background: 'var(--color-bg, #ffffff)',
    color: 'var(--color-text, #0f172a)',
    borderRadius: RADIUS[s],
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
    overflow: 'auto',
    width: vertical ? '100%' : '100%',
    maxWidth: vertical ? 'none' : '420px',
    height: vertical ? 'auto' : '100%',
    maxHeight: vertical ? '85vh' : '100%',
    transform: visible ? 'translate(0)' : sheetHiddenTransform(s),
    transition: `transform ${SHEET_ENTER_MS}ms ${SHEET_EASE}`,
  }
}
