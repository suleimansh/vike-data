// Shared, framework-agnostic style data for the text primitives, imported by BOTH the react and vue
// renderers so the shadcn Base typography surface can't drift between them. Theme-native: every
// color reads a vike-themes CSS var (with a fallback). The `text` block's `.variant()` picks one of
// the shadcn Base text styles (plain paragraph / lead / muted / blockquote / inline code); the
// existing `.tone()` still tints the color and, for the plain default, keeps its exact old behavior.
// A separate `list` block renders an ordered/unordered list on the shadcn list surface.
import { keyResolver } from './_shared.js'

// Historical tone tokens -> a color (matches the pre-restyle renderer). Exported so the primitive
// renderers (text / link) share this one map instead of each keeping a copy.
export const TONE = { muted: 'var(--color-muted)', danger: 'var(--color-danger, #dc2626)', success: 'var(--color-success, #16a34a)', info: 'var(--color-primary, #2563eb)' }

// Heading top-margin by level (h1 flush, deeper levels breathe less). Shared by both renderers.
export const HEADING_TOP = { 1: '0', 2: '1.5rem', 3: '1.25rem' }

// The shadcn Base text variants: the element tag + its style (color left to resolveTextStyle so a
// `.tone()` can override it). `default` is the historical plain span; its color is special-cased.
export const TEXT_VARIANTS = {
  default: { tag: 'span', style: {} },
  lead: { tag: 'p', style: { fontSize: '20px', lineHeight: 1.6, color: 'var(--color-muted, #64748b)', margin: '0.5rem 0' } },
  muted: { tag: 'p', style: { fontSize: '14px', lineHeight: 1.5, color: 'var(--color-muted, #64748b)', margin: '0.25rem 0' } },
  blockquote: {
    tag: 'blockquote',
    style: { margin: '1rem 0', paddingLeft: '1rem', borderLeft: '2px solid var(--color-border, #e2e8f0)', fontStyle: 'italic', color: 'var(--color-text, #0f172a)', lineHeight: 1.6 },
  },
  code: {
    tag: 'code',
    style: {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
      fontSize: '0.875em',
      background: 'color-mix(in srgb, var(--color-muted, #64748b) 15%, transparent)',
      padding: '0.15rem 0.35rem',
      borderRadius: 'var(--radius-sm, 4px)',
      color: 'var(--color-text, #0f172a)',
    },
  },
}

// Normalize a (possibly unknown) variant name to a canonical key.
export const textVariantKey = keyResolver(TEXT_VARIANTS, 'default')

// The { tag, style } for a text block. The plain `default` keeps its exact historical color rule
// (tone -> mapped color or 'inherit'; unset -> theme text color). Every other variant carries its
// own color, which a known `.tone()` overrides so the two axes compose.
export function resolveTextStyle(variant, tone) {
  const key = textVariantKey(variant)
  const v = TEXT_VARIANTS[key]
  const style = { ...v.style }
  if (key === 'default') {
    style.color = tone ? (TONE[tone] ?? 'inherit') : 'var(--color-text, inherit)'
  } else if (tone && TONE[tone]) {
    style.color = TONE[tone]
  }
  return { tag: v.tag, style }
}

// The list block: an ordered (<ol>) or unordered (<ul>) list on the shadcn list surface (indented,
// with spaced items). The <li> spacing rides a shared margin so items breathe.
export const listStyle = (ordered) => ({
  margin: '0.75rem 0',
  paddingLeft: '1.5rem',
  listStyleType: ordered ? 'decimal' : 'disc',
  color: 'var(--color-text, inherit)',
  lineHeight: 1.7,
})
export const listItemStyle = { margin: '0.25rem 0' }
