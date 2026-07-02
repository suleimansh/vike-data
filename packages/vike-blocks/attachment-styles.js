// Shared, framework-agnostic style + format data for the `attachment` block, imported by BOTH the
// react and vue renderers so the surface can't drift. Dep-free, theme-native (every color reads a
// vike-themes CSS var, with a fallback). The control is a dashed drop zone (the border goes primary on
// drag-over) above a list of the selected / declared files. The :focus-within ring + hover ride the
// `vike-blocks-attachment` class + ATTACHMENT_STYLE_TAG (a static, identical-everywhere <style>).

// The feather "upload" glyph, shared by both renderers so the icon can't drift.
export const ATTACHMENT_ICON_PATH = 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12'

// A byte count as a short human string. Returns '' for a missing/invalid size, so a declared file
// without a size just renders its name.
export function formatBytes(n) {
  if (typeof n !== 'number' || !isFinite(n) || n < 0) return ''
  if (n < 1024) return n + ' B'
  const units = ['KB', 'MB', 'GB', 'TB']
  let v = n / 1024
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return (v < 10 ? v.toFixed(1) : Math.round(v)) + ' ' + units[i]
}

// The outer wrapper (zone + file list stacked).
export function attachmentRootStyle() {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    margin: '0.5rem 0',
    font: 'inherit',
    fontSize: '14px',
    lineHeight: 1.4,
    color: 'var(--color-text, #0f172a)',
  }
}

// The dashed drop zone (a clickable label wrapping the hidden file input). The border goes primary
// while a file is dragged over it.
export function attachmentZoneStyle(disabled, dragOver) {
  return {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    padding: '1.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1.5px dashed',
    borderColor: dragOver ? 'var(--color-primary, #2563eb)' : 'var(--color-border, #cbd5e1)',
    background: dragOver ? 'var(--color-surface, #f1f5f9)' : 'var(--color-bg, #ffffff)',
    color: 'var(--color-muted, #64748b)',
    textAlign: 'center',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'border-color .15s ease, background-color .15s ease',
    boxSizing: 'border-box',
  }
}

export const attachmentIconStyle = () => ({ color: 'var(--color-muted, #64748b)', flexShrink: 0 })
export const attachmentPromptStyle = () => ({ color: 'var(--color-text, #0f172a)', fontWeight: 500 })
export const attachmentHintStyle = () => ({ fontSize: '12px', color: 'var(--color-muted, #64748b)' })

export const attachmentListStyle = () => ({ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' })

// One file row: name on the left, size then the remove button on the right.
export function attachmentFileStyle() {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.6rem',
    borderRadius: '0.375rem',
    border: '1px solid var(--color-border, #e2e8f0)',
    background: 'var(--color-surface, #f8fafc)',
  }
}

export const attachmentNameStyle = () => ({ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })
export const attachmentSizeStyle = () => ({ flexShrink: 0, fontSize: '12px', color: 'var(--color-muted, #64748b)', fontVariantNumeric: 'tabular-nums' })

// The per-file remove button (a bare × glyph).
export function attachmentRemoveStyle() {
  return {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.25rem',
    height: '1.25rem',
    padding: 0,
    border: 0,
    borderRadius: '999px',
    background: 'transparent',
    color: 'var(--color-muted, #64748b)',
    font: 'inherit',
    fontSize: '16px',
    lineHeight: 1,
    cursor: 'pointer',
  }
}

// The static <style> for the interactive states: hover + focus-within on the zone, a hover on the
// remove button, and a dimmed disabled zone.
export const ATTACHMENT_STYLE_TAG =
  '.vike-blocks-attachment:not([aria-disabled="true"]):hover{border-color:var(--color-primary,#2563eb)}' +
  '.vike-blocks-attachment:focus-within{outline:none;border-color:var(--color-primary,#2563eb);box-shadow:0 0 0 3px var(--color-ring,rgba(37,99,235,.25))}' +
  '.vike-blocks-attachment-x:hover{color:var(--color-danger,#dc2626);background:var(--color-surface,#f1f5f9)}'
