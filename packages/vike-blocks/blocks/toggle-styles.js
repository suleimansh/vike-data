// Shared, framework-agnostic style data for the `toggle-button` + `toggle-group` blocks, imported by
// BOTH the react and vue renderers so the surface can't drift. A dep-free take on the shadcn Toggle /
// ToggleGroup: a pressable button that reads "on" (a muted-primary tint + primary text) or "off"
// (transparent, ghost); a group connects them into a segmented control (shared borders, rounded ends).
// Theme-native (every color reads a vike-themes CSS var with a fallback). The :hover / :focus-visible
// states ride the `vike-blocks-toggle` class + TOGGLE_STYLE_TAG.

const RADIUS = 'var(--radius, 8px)'

// One toggle button. `on` picks the pressed surface; `grouped` + `position` ('only' | 'first' |
// 'middle' | 'last') connect it to its neighbours in a group (collapse the shared border with a -1px
// margin, round only the outer ends, and raise a pressed button so its full border shows).
export function toggleButtonStyle(on, disabled, { grouped = false, position = 'only' } = {}) {
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.4rem',
    height: '2.25rem',
    minWidth: '2.25rem',
    padding: '0 0.75rem',
    margin: 0,
    font: 'inherit',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    color: on ? 'var(--color-primary, #2563eb)' : 'var(--color-text, #0f172a)',
    background: on ? 'color-mix(in srgb, var(--color-primary, #2563eb) 12%, transparent)' : 'transparent',
    border: '1px solid var(--color-border, #cbd5e1)',
    borderRadius: RADIUS,
    cursor: disabled ? 'default' : 'pointer',
    boxSizing: 'border-box',
    transition: 'background-color .15s ease, color .15s ease',
    position: 'relative',
    ...(on ? { zIndex: 1 } : {}),
  }
  if (!grouped) return style
  if (position !== 'first') style.marginLeft = '-1px'
  if (position === 'first') style.borderRadius = `${RADIUS} 0 0 ${RADIUS}`
  else if (position === 'last') style.borderRadius = `0 ${RADIUS} ${RADIUS} 0`
  else if (position === 'middle') style.borderRadius = '0'
  return style
}

// The group container: a horizontal row of connected buttons.
export const toggleGroupStyle = () => ({ display: 'inline-flex', alignItems: 'center' })

// A single toggle button's position in a group of `count` at index `i`.
export function groupPosition(i, count) {
  if (count <= 1) return 'only'
  if (i === 0) return 'first'
  if (i === count - 1) return 'last'
  return 'middle'
}

// The static <style> for the interactive states: a muted hover tint on an off button and a
// focus-visible ring, plus a dimmed disabled state.
export const TOGGLE_STYLE_TAG =
  '.vike-blocks-toggle:not([aria-pressed=true]):not(:disabled):hover{background:color-mix(in srgb,var(--color-muted,#64748b) 12%,transparent)}' +
  '.vike-blocks-toggle:focus-visible{outline:none;z-index:2;box-shadow:0 0 0 2px var(--color-bg,#fff),0 0 0 4px var(--color-ring,var(--color-primary,#2563eb))}' +
  '.vike-blocks-toggle:disabled{opacity:.5}'
