// Shared, framework-agnostic style data for the `kbd` block, imported by BOTH the react and vue
// renderers so the key caps can't drift. Static and theme-native (every color reads a vike-themes CSS
// var, with a fallback): a small, monospace, bordered cap with a subtle bottom-edge shadow.
export const kbdGroupStyle = { display: 'inline-flex', alignItems: 'center', gap: '0.25rem', verticalAlign: 'baseline' }

export const kbdKeyStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '1.5rem',
  height: '1.5rem',
  padding: '0 0.4rem',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSize: '12px',
  lineHeight: 1,
  color: 'var(--color-muted, #475569)',
  background: 'var(--color-surface, #f1f5f9)',
  border: '1px solid var(--color-border, #e2e8f0)',
  borderRadius: 'calc(var(--radius, 8px) - 2px)',
  boxShadow: '0 1px 0 var(--color-border, #e2e8f0)',
  boxSizing: 'border-box',
}
