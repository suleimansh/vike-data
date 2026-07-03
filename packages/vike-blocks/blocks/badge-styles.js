// Shared, framework-agnostic style data for the `badge` block, imported by BOTH the react and vue
// renderers so the shadcn Base surface can't drift between them. Theme-native: every color is a
// vike-themes CSS var (with a fallback). Two axes:
//   .variant() — the shadcn Base badge surfaces: default / secondary / destructive / outline.
//   .tone()    — our historical semantic intent (muted / info / success / warning / danger), kept
//                for back-compat and rendered as a soft tinted pill (color-mix accent over the bg).
// `.variant()` wins when both are set; a bare badge (neither) is the neutral `secondary` surface.
import { keyResolver, aliasedKeyResolver } from './_shared.js'

export const VARIANTS = {
  default: { bg: 'var(--color-primary, #2563eb)', fg: 'var(--color-primary-text, #ffffff)', border: 'transparent' },
  secondary: { bg: 'var(--color-surface, #f1f5f9)', fg: 'var(--color-text, #0f172a)', border: 'transparent' },
  destructive: { bg: 'var(--color-danger, #dc2626)', fg: '#ffffff', border: 'transparent' },
  outline: { bg: 'transparent', fg: 'var(--color-text, #0f172a)', border: 'var(--color-border, #e2e8f0)' },
}

// The accent color per semantic tone. A tone renders a soft badge: accent-tinted bg + accent text.
export const TONES = {
  muted: 'var(--color-muted, #64748b)',
  info: 'var(--color-primary, #2563eb)',
  success: 'var(--color-success, #16a34a)',
  warning: 'var(--color-warning, #d97706)',
  danger: 'var(--color-danger, #dc2626)',
}
// Forgiving tone aliases (warn/error/note) resolve onto a known token.
export const TONE_ALIASES = { warn: 'warning', error: 'danger', note: 'info' }

// Normalize a (possibly aliased/unknown) variant/tone name to its canonical key.
export const variantKey = keyResolver(VARIANTS, 'secondary')
export const toneKey = aliasedKeyResolver(TONE_ALIASES, TONES, 'muted')

// The shared base layout, identical for every badge (shadcn Base: a small rounded-md pill).
const BASE = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.25rem',
  padding: '0.125rem 0.5rem',
  fontSize: '12px',
  fontWeight: 500,
  fontFamily: 'inherit',
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
  borderRadius: 'var(--radius, 8px)',
}

// The inline style for a badge. A `.variant()` picks a solid shadcn surface; otherwise a `.tone()`
// renders a soft accent tint; a bare badge falls back to the neutral secondary surface.
export function badgeStyle({ variant, tone } = {}) {
  if (variant) {
    const v = VARIANTS[variantKey(variant)]
    return { ...BASE, background: v.bg, color: v.fg, border: `1px solid ${v.border}` }
  }
  if (tone) {
    const accent = TONES[toneKey(tone)]
    return {
      ...BASE,
      background: `color-mix(in srgb, ${accent} 12%, var(--color-bg, #ffffff))`,
      color: accent,
      border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
    }
  }
  const v = VARIANTS.secondary
  return { ...BASE, background: v.bg, color: v.fg, border: `1px solid ${v.border}` }
}
