// Shared, framework-agnostic style data for the `textarea` block, imported by BOTH the react and vue
// renderers so the surface can't drift. From-scratch + theme-native (every color reads a vike-themes
// CSS var, with a fallback). The multi-line sibling of input-styles: same bordered surface + focus
// ring / placeholder / disabled states, but auto-height with a `min-height` and vertical resize. The
// :focus-visible / ::placeholder / :disabled states ride the `vike-blocks-textarea` class + a static
// TEXTAREA_STYLE_TAG (identical everywhere, so duplicate tags collapse) — dep-free, SSR-safe.
export function textareaStyle(disabled) {
  return {
    display: 'block',
    width: '100%',
    minHeight: '4.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '14px',
    fontFamily: 'inherit',
    lineHeight: 1.5,
    color: 'var(--color-text, #0f172a)',
    background: 'var(--color-bg, #ffffff)',
    border: '1px solid var(--color-border, #e2e8f0)',
    borderRadius: 'var(--radius, 8px)',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
    cursor: disabled ? 'default' : 'text',
  }
}

export const TEXTAREA_STYLE_TAG =
  '.vike-blocks-textarea{transition:border-color .15s ease,box-shadow .15s ease}' +
  '.vike-blocks-textarea::placeholder{color:var(--color-muted,#94a3b8)}' +
  '.vike-blocks-textarea:focus-visible{border-color:var(--color-ring,var(--color-primary,#2563eb));box-shadow:0 0 0 3px color-mix(in srgb,var(--color-ring,var(--color-primary,#2563eb)) 25%,transparent)}' +
  '.vike-blocks-textarea:disabled{opacity:.5;cursor:default;background:var(--color-surface,#f1f5f9)}'
