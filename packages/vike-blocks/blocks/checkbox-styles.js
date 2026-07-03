// Shared, framework-agnostic style data for the `checkbox` block, imported by BOTH the react and vue
// renderers so the surface can't drift. Dep-free reimplementation of the animate-ui Base checkbox,
// theme-native (every color reads a vike-themes CSS var, with a fallback). The control is an
// accessible <button role="checkbox">; the box fills when checked and the SVG check springs in
// (scale + fade, no motion lib). The :focus-visible ring rides the `vike-blocks-checkbox` class +
// CHECKBOX_STYLE_TAG (a static, identical-everywhere <style>).

// The clickable root (a bare button carrying the box + label).
export function checkboxRootStyle(disabled) {
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

// The box: an empty outline when unchecked, filled with the primary color when checked.
export function checkboxBoxStyle(checked) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '1.05rem',
    height: '1.05rem',
    borderRadius: 'calc(var(--radius, 8px) - 3px)',
    border: `1px solid ${checked ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #cbd5e1)'}`,
    background: checked ? 'var(--color-primary, #2563eb)' : 'var(--color-bg, #ffffff)',
    transition: 'background-color .18s ease, border-color .18s ease',
    boxSizing: 'border-box',
  }
}

// The check mark springs in on check and shrinks/fades out on uncheck.
export const checkStyle = (checked) => ({
  transition: 'transform .18s cubic-bezier(0.34, 1.56, 0.64, 1), opacity .12s ease',
  transform: checked ? 'scale(1)' : 'scale(0.5)',
  opacity: checked ? 1 : 0,
})

// The static <style> for the interactive states: a focus-visible ring on the control and a dimmed
// disabled state.
export const CHECKBOX_STYLE_TAG =
  '.vike-blocks-checkbox:focus-visible{outline:none;box-shadow:0 0 0 2px var(--color-bg,#fff),0 0 0 4px var(--color-ring,var(--color-primary,#2563eb));border-radius:calc(var(--radius,8px) - 1px)}' +
  '.vike-blocks-checkbox:disabled{opacity:.5}'
