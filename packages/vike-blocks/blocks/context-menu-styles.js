// Shared, framework-agnostic logic + styling for the `context-menu` block, imported by BOTH renderers
// so the twins can't drift. The menu's box + item rows + roving-focus are reused from the dropdown /
// popover modules (imported directly in the renderers); this owns the one genuinely new piece — placing
// the menu at the cursor and flipping it at the viewport edge — plus the default trigger affordance.

// Place the menu at the cursor, flipping so it never overflows the viewport. Given the cursor point,
// the measured menu size, and the viewport, return the top-left {left, top}: if the menu would spill off
// the right edge it opens to the LEFT of the cursor, if off the bottom it opens ABOVE, and either way it
// is clamped to a small margin so it never clips. A pure function — unit-tested, no DOM.
export function clampMenuPosition(cursor, menu, viewport, margin = 8) {
  const maxLeft = Math.max(margin, viewport.width - menu.width - margin)
  const maxTop = Math.max(margin, viewport.height - menu.height - margin)
  // prefer opening down-right from the cursor; flip when that side lacks room
  let left = cursor.x
  if (cursor.x + menu.width + margin > viewport.width) left = cursor.x - menu.width
  let top = cursor.y
  if (cursor.y + menu.height + margin > viewport.height) top = cursor.y - menu.height
  return {
    left: Math.min(Math.max(margin, left), maxLeft),
    top: Math.min(Math.max(margin, top), maxTop),
  }
}

// The default right-click region when no `.on(block)` is given: a dashed, muted affordance box that
// tells the user it is right-clickable.
export function contextTriggerStyle() {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    border: '1px dashed var(--color-border, #cbd5e1)',
    borderRadius: 'var(--radius, 8px)',
    background: 'var(--color-surface, #f8fafc)',
    color: 'var(--color-muted, #64748b)',
    fontSize: '14px',
    userSelect: 'none',
    cursor: 'context-menu',
  }
}

// The fixed-position wrapper the portalled menu panel renders into. The panel's own box (surface +
// padding + shadow) comes from popoverSurfaceStyle; this only pins it and drives the enter fade/scale.
export function contextPanelStyle(pos, visible) {
  return {
    position: 'fixed',
    left: `${pos.left}px`,
    top: `${pos.top}px`,
    zIndex: 60,
    minWidth: '11rem',
    transformOrigin: 'top left',
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1)' : 'scale(0.96)',
    transition: 'opacity 0.12s ease, transform 0.12s ease',
  }
}
