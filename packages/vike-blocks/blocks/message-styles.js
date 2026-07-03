// Shared, framework-agnostic style data for the `message` block, imported by BOTH the react and vue
// renderers so the surface can't drift. From-scratch + theme-native (every color reads a vike-themes
// CSS var, with a fallback): an avatar on the sender's outer side, then a column with an author +
// timestamp header and the bubble, the whole row aligned by sender (user right, assistant left).
import { initials } from './_shared.js'

export const messageRowStyle = (from) => ({
  display: 'flex',
  flexDirection: from === 'user' ? 'row-reverse' : 'row',
  alignItems: 'flex-start',
  gap: '0.5rem',
  margin: '0.5rem 0',
})

export function messageAvatarStyle(from) {
  const user = from === 'user'
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '1.75rem',
    height: '1.75rem',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 600,
    background: user ? 'var(--color-primary, #2563eb)' : 'var(--color-surface, #e2e8f0)',
    color: user ? 'var(--color-primary-text, #ffffff)' : 'var(--color-text, #0f172a)',
  }
}

// The column holds the header + bubble; it aligns to the sender's side and caps its width.
export const messageColumnStyle = (from) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: from === 'user' ? 'flex-end' : 'flex-start',
  gap: '0.15rem',
  maxWidth: '80%',
  minWidth: 0,
})

export const messageHeaderStyle = (from) => ({
  display: 'flex',
  flexDirection: from === 'user' ? 'row-reverse' : 'row',
  alignItems: 'baseline',
  gap: '0.4rem',
  padding: '0 0.15rem',
})
export const messageAuthorStyle = { fontSize: '13px', fontWeight: 600, color: 'var(--color-text, #0f172a)' }
export const messageTimeStyle = { fontSize: '12px', color: 'var(--color-muted, #64748b)' }

// The initials shown in the avatar, derived from the author name (falls back by sender). Shares the
// canonical first+last `initials` with the avatar block so the two can't diverge; the sender fallback
// (U / AI) is message-specific.
export function avatarInitials(author, from) {
  return initials(author) || (from === 'user' ? 'U' : 'AI')
}
