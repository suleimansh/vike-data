// Shared, framework-agnostic style data for the `input` block, imported by BOTH the react and vue
// renderers so the surface can't drift between them. From-scratch + theme-native: every color reads
// a vike-themes CSS var (with a fallback). The :focus-visible ring / ::placeholder color / disabled
// state can't be inline styles, so the element carries a `vike-blocks-input` class and INPUT_STYLE_TAG
// (a static, identical-everywhere <style>) wires those states — dep-free, SSR-safe.
export function inputStyle(disabled) {
  return {
    display: 'block',
    width: '100%',
    height: '2.25rem',
    padding: '0 0.75rem',
    fontSize: '14px',
    fontFamily: 'inherit',
    lineHeight: 1,
    color: 'var(--color-text, #0f172a)',
    background: 'var(--color-bg, #ffffff)',
    border: '1px solid var(--color-border, #e2e8f0)',
    borderRadius: 'var(--radius, 8px)',
    boxSizing: 'border-box',
    outline: 'none',
    cursor: disabled ? 'default' : 'text',
  }
}

// The static <style> that gives the input its interactive states (identical for every input, so
// duplicate tags collapse to one effect): a placeholder tint, a focus-visible ring, and a dimmed
// disabled surface.
export const INPUT_STYLE_TAG =
  '.vike-blocks-input{transition:border-color .15s ease,box-shadow .15s ease}' +
  '.vike-blocks-input::placeholder{color:var(--color-muted,#94a3b8)}' +
  '.vike-blocks-input:focus-visible{border-color:var(--color-ring,var(--color-primary,#2563eb));box-shadow:0 0 0 3px color-mix(in srgb,var(--color-ring,var(--color-primary,#2563eb)) 25%,transparent)}' +
  '.vike-blocks-input:disabled{opacity:.5;cursor:default;background:var(--color-surface,#f1f5f9)}'
