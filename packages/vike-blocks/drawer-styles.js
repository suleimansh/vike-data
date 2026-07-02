// Shared, framework-agnostic drag math + handle geometry for the `drawer` block, imported by BOTH the
// react and vue renderers so the two twins can't drift. The drawer reuses the sheet's edge-slide
// geometry (sheet-styles) for its resting position; this module adds only the drag-to-dismiss bits: a
// grabber handle and the pure functions that turn a pointer delta into a dismiss offset + transform,
// and decide when a flick has crossed the close threshold. Dep-free, theme-native.

// A drag past this many pixels toward the anchored edge dismisses the drawer.
export const DRAWER_CLOSE_THRESHOLD = 90

// The distance dragged in the DISMISS direction (toward the anchored edge), never negative — dragging
// away from the edge does nothing.
export function dismissOffset(side, dx, dy) {
  switch (side) {
    case 'top':
      return Math.max(0, -dy)
    case 'left':
      return Math.max(0, -dx)
    case 'right':
      return Math.max(0, dx)
    case 'bottom':
    default:
      return Math.max(0, dy)
  }
}

// The transform that follows the finger while dragging (along the dismiss axis only).
export function dismissTransform(side, offset) {
  switch (side) {
    case 'top':
      return `translateY(${-offset}px)`
    case 'left':
      return `translateX(${-offset}px)`
    case 'right':
      return `translateX(${offset}px)`
    case 'bottom':
    default:
      return `translateY(${offset}px)`
  }
}

// Whether a release at this offset should dismiss (crossed the threshold).
export const shouldDismiss = (offset, threshold = DRAWER_CLOSE_THRESHOLD) => offset >= threshold

// The grabber bar: a short rounded pill, horizontal for a top/bottom drawer and vertical for a
// left/right one, sized to read as a drag affordance. It is the drag surface (the pointer handlers ride
// it), so it shows a grab cursor.
export function drawerHandleStyle(side) {
  const vertical = side === 'left' || side === 'right'
  return {
    flexShrink: 0,
    alignSelf: 'center',
    width: vertical ? '0.3rem' : '2.25rem',
    height: vertical ? '2.25rem' : '0.3rem',
    borderRadius: '999px',
    background: 'var(--color-border, #cbd5e1)',
    cursor: 'grab',
    touchAction: 'none',
  }
}
