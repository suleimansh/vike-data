// Shared, framework-agnostic styling + filter helper for the `combobox` block, imported by BOTH the
// react and vue renderers so the twins can't drift. The combobox is INPUT-ANCHORED: the trigger IS the
// search input (you type in place to filter), and the floating list opens directly below it. The list
// panel's box + motion come from the popover primitive (popoverSurfaceStyle + popoverMotionStyle); this
// owns the input look, the option rows, and the empty state. Every color reads a vike-themes CSS var.

// The SVG chevron (shadcn/lucide chevron-down), stroked in currentColor.
export const CHEVRON_DOWN_PATH = 'm6 9 6 6 6-6'

// The relative wrapper the chevron is absolutely positioned within (the whole thing is the popover anchor).
export const comboboxWrapStyle = () => ({ position: 'relative', display: 'block', width: '100%' })

// The search input that doubles as the trigger — a select-like box with room for the chevron.
export function comboboxInputStyle(disabled) {
  return {
    display: 'block',
    width: '100%',
    height: '2.25rem',
    padding: '0 2rem 0 0.75rem',
    fontSize: '14px',
    fontFamily: 'inherit',
    lineHeight: 1,
    color: 'var(--color-text, #0f172a)',
    background: 'var(--color-bg, #ffffff)',
    border: '1px solid var(--color-border, #e2e8f0)',
    borderRadius: 'var(--radius, 8px)',
    boxSizing: 'border-box',
    outline: 'none',
    cursor: disabled ? 'default' : 'text',
  }
}

// The chevron slot overlaid at the right edge (pointer-events off so a click falls through to the input).
export const comboboxChevronStyle = () => ({
  position: 'absolute',
  right: '0.6rem',
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'inline-flex',
  lineHeight: 0,
  pointerEvents: 'none',
  color: 'var(--color-muted, #64748b)',
})

// The scrollable list region.
export const comboboxListStyle = () => ({ maxHeight: '14rem', overflowY: 'auto' })

// One option row (a non-focusable role="option" div, so focus stays in the input while you arrow through).
// `active` is the keyboard/hover-highlighted row; `selected` is the chosen value.
export function comboboxItemStyle(active, selected) {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.45rem 0.6rem',
    borderRadius: 'calc(var(--radius, 8px) - 3px)',
    background: active ? 'var(--color-surface, #f1f5f9)' : 'transparent',
    color: 'var(--color-text, #0f172a)',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: selected ? 600 : 400,
  }
}

// The no-results row shown when the filter matches nothing.
export const comboboxEmptyStyle = () => ({ padding: '0.6rem', fontSize: '14px', color: 'var(--color-muted, #64748b)', textAlign: 'center' })

// Static <style> for the input focus ring / disabled state + the placeholder tint. Uses :focus (not
// :focus-visible) so the ring shows while you type with the list open.
export const COMBOBOX_STYLE_TAG =
  '.vike-blocks-combobox-input{transition:border-color .15s ease,box-shadow .15s ease}' +
  '.vike-blocks-combobox-input::placeholder{color:var(--color-muted,#94a3b8)}' +
  '.vike-blocks-combobox-input:focus{border-color:var(--color-ring,var(--color-primary,#2563eb));box-shadow:0 0 0 3px color-mix(in srgb,var(--color-ring,var(--color-primary,#2563eb)) 25%,transparent)}' +
  '.vike-blocks-combobox-input:disabled{opacity:.5;cursor:default;background:var(--color-surface,#f1f5f9)}'

// Filter the options by a query, matching the label OR the value case-insensitively. An empty query
// returns everything. Agnostic + pure, so it is unit-tested and shared by both renderers.
export function filterOptions(options, query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return options
  return options.filter((o) => String(o.label).toLowerCase().includes(q) || String(o.value).toLowerCase().includes(q))
}
