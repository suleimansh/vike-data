// Shared, framework-agnostic style data for the `switch` block, imported by BOTH the react and vue
// renderers so the surface can't drift. Dep-free, theme-native (every color reads a vike-themes CSS
// var, with a fallback). An accessible <button role="switch"> is a pill track with a thumb that slides
// across as it turns on (the track fills with the primary color, the thumb translates), animated with
// a CSS transition (no motion lib). The :focus-visible ring rides the `vike-blocks-switch` class +
// SWITCH_STYLE_TAG (a static, identical-everywhere <style>).

// The clickable root (a bare button carrying the track + label).
export function switchRootStyle(disabled) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '0.25rem 0',
    padding: 0,
    border: 0,
    background: 'transparent',
    font: 'inherit',
    fontSize: '14px',
    lineHeight: 1.4,
    color: 'var(--color-text, #0f172a)',
    cursor: disabled ? 'default' : 'pointer',
    textAlign: 'left',
  }
}

// The pill track: neutral when off, primary when on.
export function switchTrackStyle(checked) {
  return {
    position: 'relative',
    flexShrink: 0,
    width: '2.25rem',
    height: '1.25rem',
    borderRadius: '999px',
    border: '1px solid',
    borderColor: checked ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #cbd5e1)',
    background: checked ? 'var(--color-primary, #2563eb)' : 'var(--color-surface, #e2e8f0)',
    transition: 'background-color .18s ease, border-color .18s ease',
    boxSizing: 'border-box',
  }
}

// The thumb slides from the left edge to the right edge as the switch turns on.
export const switchThumbStyle = (checked) => ({
  position: 'absolute',
  top: '50%',
  left: '2px',
  width: '1rem',
  height: '1rem',
  borderRadius: '999px',
  background: 'var(--color-bg, #ffffff)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  transition: 'transform .18s cubic-bezier(0.34, 1.56, 0.64, 1)',
  transform: checked ? 'translate(1rem, -50%)' : 'translate(0, -50%)',
})

// The static <style> for the interactive states: a focus-visible ring on the control and a dimmed
// disabled state.
export const SWITCH_STYLE_TAG =
  '.vike-blocks-switch:focus-visible{outline:none;box-shadow:0 0 0 2px var(--color-bg,#fff),0 0 0 4px var(--color-ring,var(--color-primary,#2563eb));border-radius:999px}' +
  '.vike-blocks-switch:disabled{opacity:.5}'
