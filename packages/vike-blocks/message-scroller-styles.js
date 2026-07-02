// Shared, framework-agnostic style data for the `message-scroller` block, imported by BOTH the react
// and vue renderers so the surface can't drift. Theme-native (every color reads a vike-themes CSS var,
// with a fallback): a bordered, rounded scroll viewport with a floating circular jump-to-latest button
// pinned to the bottom center.
export const scrollerWrapStyle = { position: 'relative', margin: '0.75rem 0' }

export const scrollerViewportStyle = (maxHeight) => ({
  maxHeight,
  overflowY: 'auto',
  padding: '0.5rem 0.85rem',
  border: '1px solid var(--color-border, #e2e8f0)',
  borderRadius: 'var(--radius, 12px)',
  background: 'var(--color-bg, #ffffff)',
})

export const jumpButtonStyle = {
  position: 'absolute',
  bottom: '0.75rem',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
  borderRadius: '999px',
  border: '1px solid var(--color-border, #e2e8f0)',
  background: 'var(--color-surface, #f1f5f9)',
  color: 'var(--color-text, #0f172a)',
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
  fontSize: '15px',
  lineHeight: 1,
}

// How close to the bottom (px) still counts as "stuck to the bottom" (hides the jump button).
export const AT_BOTTOM_THRESHOLD = 24
