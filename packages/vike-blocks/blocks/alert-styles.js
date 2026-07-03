// Shared, framework-agnostic style data for the `alert` block, imported by BOTH the react and vue
// renderers so the shadcn Radix surface can't drift between them. The shadcn Radix alert is a
// BORDERED box (not the old tinted borderless one) with a bare icon, a medium-weight title, and a
// muted description; its two variants are default + destructive. Our four-intent API maps on:
// info / success / warning render the default surface with an accent-colored icon; danger takes the
// destructive treatment (accent-tinted border + accent title). Theme-native: every color is a
// vike-themes CSS var with a fallback.
import { aliasedKeyResolver } from './_shared.js'

export const INTENTS = {
  info: { accent: 'var(--color-primary, #2563eb)', icon: 'i', destructive: false },
  success: { accent: 'var(--color-success, #16a34a)', icon: '✓', destructive: false },
  warning: { accent: 'var(--color-warning, #d97706)', icon: '!', destructive: false },
  danger: { accent: 'var(--color-danger, #dc2626)', icon: '✕', destructive: true },
}
// Forgiving aliases so warn/error/note resolve to a known intent.
export const ALIASES = { warn: 'warning', error: 'danger', note: 'info' }

// Normalize a (possibly aliased/unknown) intent name to its canonical key.
export const intentKey = aliasedKeyResolver(ALIASES, INTENTS, 'info')

// The computed style pieces for an intent, so the react/vue renderers stay thin twins.
export function alertStyles(intent) {
  const it = INTENTS[intentKey(intent)]
  const border = it.destructive
    ? `color-mix(in srgb, ${it.accent} 50%, var(--color-border, #e2e8f0))`
    : 'var(--color-border, #e2e8f0)'
  return {
    icon: it.icon,
    box: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-start',
      padding: '0.75rem 1rem',
      margin: '0.6rem 0',
      border: `1px solid ${border}`,
      borderRadius: 'var(--radius, 8px)',
      background: 'var(--color-bg, #ffffff)',
      color: 'var(--color-text, #0f172a)',
    },
    iconStyle: { flexShrink: 0, fontSize: '16px', fontWeight: 700, lineHeight: 1.4, color: it.accent },
    titleStyle: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.4,
      color: it.destructive ? it.accent : 'var(--color-text, #0f172a)',
    },
    bodyStyle: (hasTitle) => ({
      margin: hasTitle ? '0.15rem 0 0' : 0,
      fontSize: '14px',
      color: 'var(--color-muted, #475569)',
      lineHeight: 1.5,
    }),
  }
}
