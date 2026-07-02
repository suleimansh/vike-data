// Shared, framework-agnostic style data for the `item` block, imported by BOTH the react and vue
// renderers so the row can't drift. Static and theme-native (every color reads a vike-themes CSS var,
// with a fallback): a leading media chip, a title + muted description column, and a muted trailing
// note pushed to the far end.
export const itemRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.6rem 0.25rem',
  color: 'var(--color-text, #0f172a)',
}

export const itemMediaStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  width: '2rem',
  height: '2rem',
  borderRadius: 'calc(var(--radius, 8px) - 2px)',
  background: 'var(--color-surface, #f1f5f9)',
  fontSize: '16px',
  lineHeight: 1,
}

export const itemBodyStyle = { display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0, flex: 1 }
export const itemTitleStyle = { fontSize: '14px', fontWeight: 500, lineHeight: 1.35 }
export const itemDescriptionStyle = { fontSize: '13px', color: 'var(--color-muted, #64748b)', lineHeight: 1.4 }
export const itemTrailingStyle = { flexShrink: 0, marginLeft: 'auto', fontSize: '13px', color: 'var(--color-muted, #64748b)' }
