// Shared, framework-agnostic style data for the `radio` block, imported by BOTH the react and vue
// renderers so the surface can't drift. Dep-free reimplementation of the animate-ui Base radio,
// theme-native (every color reads a vike-themes CSS var, with a fallback). Each option is an
// accessible <button role="radio"> in a role="radiogroup"; the selected option's inner dot springs in
// (scale + fade, no motion lib). The :focus-visible ring rides the `vike-blocks-radio` class +
// RADIO_STYLE_TAG (a static, identical-everywhere <style>).

// The group container (a vertical stack of options).
export const radioRootStyle = () => ({ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.25rem 0' })

// One option row (a bare button carrying the circle + label).
export function radioOptionStyle(disabled) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: 0,
    padding: '0.1rem 0',
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

// The outer circle: a plain outline that turns primary-bordered when selected.
export function radioCircleStyle(selected) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '1.05rem',
    height: '1.05rem',
    borderRadius: '999px',
    border: `1px solid ${selected ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #cbd5e1)'}`,
    background: 'var(--color-bg, #ffffff)',
    transition: 'border-color .18s ease',
    boxSizing: 'border-box',
  }
}

// The inner dot springs in on select and shrinks/fades out when another option is chosen.
export const radioDotStyle = (selected) => ({
  width: '0.55rem',
  height: '0.55rem',
  borderRadius: '999px',
  background: 'var(--color-primary, #2563eb)',
  transition: 'transform .18s cubic-bezier(0.34, 1.56, 0.64, 1), opacity .12s ease',
  transform: selected ? 'scale(1)' : 'scale(0)',
  opacity: selected ? 1 : 0,
})

// The static <style> for the interactive states: a focus-visible ring on an option and a dimmed
// disabled state.
export const RADIO_STYLE_TAG =
  '.vike-blocks-radio:focus-visible{outline:none;box-shadow:0 0 0 2px var(--color-bg,#fff),0 0 0 4px var(--color-ring,var(--color-primary,#2563eb));border-radius:calc(var(--radius,8px) - 2px)}' +
  '.vike-blocks-radio:disabled{opacity:.5}'
