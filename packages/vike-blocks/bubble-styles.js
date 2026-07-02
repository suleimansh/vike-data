// Shared, framework-agnostic style data for the `bubble` block, imported by BOTH the react and vue
// renderers so the surface can't drift. From-scratch + theme-native (every color reads a vike-themes
// CSS var, with a fallback): a rounded message bubble aligned to its sender (user right + primary,
// assistant left + surface), with a squared-off tail corner on the sender's side.
export const bubbleRowStyle = (from) => ({
  display: 'flex',
  justifyContent: from === 'user' ? 'flex-end' : 'flex-start',
  margin: '0.35rem 0',
})

export function bubbleStyle(from) {
  const user = from === 'user'
  return {
    maxWidth: '80%',
    padding: '0.55rem 0.85rem',
    fontSize: '14px',
    lineHeight: 1.5,
    borderRadius: '1rem',
    wordBreak: 'break-word',
    ...(user
      ? { background: 'var(--color-primary, #2563eb)', color: 'var(--color-primary-text, #ffffff)', borderBottomRightRadius: '0.25rem' }
      : { background: 'var(--color-surface, #f1f5f9)', color: 'var(--color-text, #0f172a)', borderBottomLeftRadius: '0.25rem' }),
  }
}
