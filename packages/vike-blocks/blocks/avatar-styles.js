// Shared, framework-agnostic style data + helpers for the `avatar` / `avatarGroup` blocks, imported by
// BOTH the react and vue renderers so the surface can't drift. Dep-free reimplementation of shadcn's
// Radix avatar: an image over an initials fallback (the img hides itself on load error, revealing the
// initials — the only JS, an inline onError), an optional status dot, and an overlapping group with a
// "+N" count. Theme-native via `var(--color-*)`.

// Derive up-to-two initials from a name: first+last initial for a full name, the first letter for a
// mononym, '' for nothing (the renderer then shows a user icon). The canonical form lives in _shared
// (the message block reuses it); re-exported here since the avatar renderers import it from this module.
export { initials } from './_shared.js'

// Named presence colors for the status dot; an unknown value is used as a raw CSS color.
export const STATUS_COLORS = { online: '#22c55e', busy: '#ef4444', away: '#f59e0b', offline: '#94a3b8' }
export const statusColor = (status) => STATUS_COLORS[status] ?? status

// The lucide `user` glyph, drawn when there's neither an image nor initials.
export const USER_ICON = { body: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', head: { cx: 12, cy: 7, r: 4 } }

// The outer box — sized, not clipped (so the status dot / ring can sit on the edge).
export const avatarRootStyle = (size = 36) => ({ position: 'relative', display: 'inline-flex', width: `${size}px`, height: `${size}px`, flexShrink: 0, verticalAlign: 'middle' })

// The clipped surface that holds the initials + image: the circle/square, the muted fallback bg + text.
export function avatarSurfaceStyle(size = 36, shape = 'circle') {
  return {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: shape === 'square' ? 'var(--radius, 8px)' : '999px',
    background: 'var(--color-surface, #f1f5f9)',
    color: 'var(--color-muted, #64748b)',
    fontSize: `${Math.round(size * 0.4)}px`,
    fontWeight: 600,
    lineHeight: 1,
    userSelect: 'none',
  }
}

// The image, laid over the initials; object-fit cover keeps it square.
export const avatarImgStyle = () => ({ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' })

// The presence dot at the bottom-right, ringed in the page bg so it reads off the avatar.
export function statusDotStyle(size = 36, color = STATUS_COLORS.online) {
  const dot = Math.max(8, Math.round(size * 0.28))
  return { position: 'absolute', right: '2%', bottom: '2%', width: `${dot}px`, height: `${dot}px`, borderRadius: '999px', background: color, boxShadow: '0 0 0 2px var(--color-bg, #ffffff)' }
}

// The group row; each avatar after the first overlaps the previous and gets a ring to separate them.
export const avatarGroupStyle = () => ({ display: 'inline-flex', alignItems: 'center' })
export function avatarGroupItemStyle(index = 0, size = 36) {
  return { display: 'inline-flex', marginLeft: index === 0 ? 0 : `-${Math.round(size * 0.3)}px`, borderRadius: '999px', boxShadow: '0 0 0 2px var(--color-bg, #ffffff)' }
}

// The "+N" overflow chip, matching the avatars' size + ring.
export function avatarCountStyle(size = 36) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: `${size}px`,
    height: `${size}px`,
    flexShrink: 0,
    marginLeft: `-${Math.round(size * 0.3)}px`,
    borderRadius: '999px',
    background: 'var(--color-surface, #f1f5f9)',
    color: 'var(--color-muted, #64748b)',
    fontSize: `${Math.round(size * 0.36)}px`,
    fontWeight: 600,
    boxShadow: '0 0 0 2px var(--color-bg, #ffffff)',
    userSelect: 'none',
  }
}
