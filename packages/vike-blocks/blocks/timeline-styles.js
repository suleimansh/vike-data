// Shared, framework-agnostic style data for the `timeline` block, imported by BOTH renderers so the
// surface can't drift. A from-scratch, dep-free vertical activity feed (Ant Timeline UX): a rail of
// tone-colored dots joined by a connector line, each row a title + optional time + a body. Theme-native
// via `var(--color-*)`; no JS, no state.

// The timeline tones -> the dot color. Default reads the primary; muted for less-important events.
export const TIMELINE_TONES = {
  default: 'var(--color-primary, #2563eb)',
  muted: 'var(--color-muted, #94a3b8)',
  success: 'var(--color-success, #16a34a)',
  warning: 'var(--color-warning, #d97706)',
  danger: 'var(--color-danger, #dc2626)',
}
export const timelineDotColor = (tone) => TIMELINE_TONES[tone] ?? TIMELINE_TONES.default

export const timelineStyle = () => ({ display: 'flex', flexDirection: 'column', margin: '0.5rem 0', padding: 0, listStyle: 'none' })

// One row: the rail column (dot + connector) beside the content column.
export const timelineItemStyle = () => ({ display: 'flex', gap: '0.85rem' })

// The rail column holds the dot; a connector line fills the space below it (omitted on the last row).
export const timelineRailStyle = () => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' })
// A dot: solid (filled) reads as a completed/current event, a ring (hollow) as an upcoming one.
export function timelineDotStyle(tone, filled = true) {
  const color = timelineDotColor(tone)
  return {
    width: '11px',
    height: '11px',
    marginTop: '4px',
    borderRadius: '50%',
    boxSizing: 'border-box',
    flexShrink: 0,
    background: filled ? color : 'var(--color-bg, #ffffff)',
    border: `2px solid ${color}`,
  }
}
export const timelineConnectorStyle = () => ({ flex: 1, width: '2px', margin: '4px 0', background: 'var(--color-border, #e2e8f0)' })

export const timelineContentStyle = () => ({ paddingBottom: '1.1rem', minWidth: 0 })
export const timelineHeaderStyle = () => ({ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' })
export const timelineTitleStyle = () => ({ fontSize: '14px', fontWeight: 600, color: 'var(--color-text, #0f172a)' })
export const timelineTimeStyle = () => ({ fontSize: '12px', color: 'var(--color-muted, #64748b)', fontVariantNumeric: 'tabular-nums' })
export const timelineBodyStyle = () => ({ marginTop: '0.25rem', fontSize: '14px', color: 'var(--color-muted, #64748b)' })
export const timelineBlocksStyle = () => ({ marginTop: '0.35rem' })
