// Shared, framework-agnostic styling for the `description-list` block, imported by BOTH renderers so the
// twins can't drift. A responsive CSS grid of term/value cells with an optional bordered (table-like)
// variant. All colors/radius read vike-themes CSS vars. No logic beyond styles — the block is static.

export const dlRootStyle = () => ({ font: 'inherit', color: 'var(--color-text, #0f172a)' })

export const dlTitleStyle = () => ({ margin: '0 0 0.75rem', fontSize: '15px', fontWeight: 600, color: 'var(--color-text, #0f172a)' })

// The grid. `columns` sets the track count. A bordered list draws its top + left edges here and lets the
// cells draw their right + bottom lines, so the two never double up (and a partial last row stays clean);
// radius + overflow round the corners. The `vike-blocks-dl` class carries the responsive collapse.
export function dlGridStyle(columns, bordered) {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: bordered ? 0 : '0.9rem 1.25rem',
    margin: 0,
    ...(bordered
      ? { borderTop: '1px solid var(--color-border, #e2e8f0)', borderLeft: '1px solid var(--color-border, #e2e8f0)', borderRadius: 'var(--radius, 8px)', overflow: 'hidden' }
      : {}),
  }
}

// One term/value cell (a `<div>` grouping a `<dt>` + `<dd>`, valid inside a `<dl>`). Spans `span`
// columns. A bordered cell draws its right + bottom separators (the grid owns top + left); a plain cell
// is borderless and relies on the grid gap.
export function dlItemStyle(span, bordered) {
  return {
    gridColumn: `span ${span}`,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    ...(bordered
      ? { gap: '0.25rem', padding: '0.6rem 0.85rem', borderRight: '1px solid var(--color-border, #e2e8f0)', borderBottom: '1px solid var(--color-border, #e2e8f0)' }
      : { gap: '0.2rem' }),
  }
}

export const dlTermStyle = () => ({ margin: 0, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-muted, #64748b)' })

export const dlValueStyle = () => ({ margin: 0, fontSize: '14px', color: 'var(--color-text, #0f172a)', overflowWrap: 'anywhere' })

// Static <style>: collapse to a single column on narrow screens (each cell spans the full width), and
// tidy the bordered variant's edge cells so only inner separators show. Class-only selectors (no quoted
// attribute selectors — Vue escapes those inside <style>).
export const DL_STYLE_TAG =
  '@media (max-width: 560px){.vike-blocks-dl{grid-template-columns:1fr !important}.vike-blocks-dl > *{grid-column:1 / -1 !important}}'
