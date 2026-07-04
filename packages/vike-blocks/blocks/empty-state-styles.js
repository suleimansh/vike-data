// Shared, framework-agnostic styling for the `empty-state` block, imported by BOTH the react and vue
// renderers so they can't drift. An empty state is a centered column: an illustration/icon medallion,
// a title, a muted description, and an optional row of action blocks. Theme-native (var(--color-*) with
// fallbacks). All static — no state, no motion.

// The default illustration when the block has no custom `.icon(block)`: a feather "inbox" outline,
// drawn as a stroked <path> inside a muted circular medallion. viewBox 0 0 24 24.
export const EMPTY_STATE_ICON_PATH =
  'M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z'

// The outer centered container.
export function emptyStateStyle() {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '0.35rem',
    padding: '2.5rem 1.5rem',
    border: '1px dashed var(--color-border, #e2e8f0)',
    borderRadius: 'var(--radius, 12px)',
    background: 'var(--color-surface, transparent)',
    color: 'var(--color-text, #0f172a)',
  }
}

// The circular medallion behind the icon (muted tint so the icon reads on any theme).
export function emptyStateMedallionStyle() {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '3rem',
    height: '3rem',
    marginBottom: '0.65rem',
    borderRadius: '999px',
    background: 'color-mix(in srgb, var(--color-muted, #64748b) 14%, transparent)',
    color: 'var(--color-muted, #64748b)',
  }
}

export function emptyStateTitleStyle() {
  return { fontSize: '16px', fontWeight: 600, lineHeight: 1.3, margin: 0 }
}

export function emptyStateDescriptionStyle() {
  return { fontSize: '14px', color: 'var(--color-muted, #64748b)', lineHeight: 1.5, margin: 0, maxWidth: '28rem' }
}

// The action row below the copy (buttons / links), only rendered when there are actions.
export function emptyStateActionsStyle() {
  return { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }
}
