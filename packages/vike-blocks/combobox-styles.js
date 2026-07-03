// Shared, framework-agnostic styling + filter helper for the `combobox` block, imported by BOTH the
// react and vue renderers so the twins can't drift. The floating panel's box + motion come from the
// popover primitive (popoverSurfaceStyle + popoverMotionStyle); this owns the trigger look, the search
// input, the option rows, and the empty state. Every color reads a vike-themes CSS var (with a fallback).

// The trigger button: a select-like box that shows the current selection (or the placeholder) + a chevron.
export function comboboxTriggerStyle(disabled) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    width: '100%',
    minWidth: '12rem',
    height: '2.25rem',
    padding: '0 0.75rem',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: 'var(--color-text, #0f172a)',
    background: 'var(--color-bg, #ffffff)',
    border: '1px solid var(--color-border, #e2e8f0)',
    borderRadius: 'var(--radius, 8px)',
    boxSizing: 'border-box',
    cursor: disabled ? 'default' : 'pointer',
    textAlign: 'left',
  }
}

// The muted look of the trigger label while nothing is selected (the placeholder is showing).
export const comboboxPlaceholderStyle = () => ({ color: 'var(--color-muted, #94a3b8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })

// The search input pinned at the top of the panel (a bottom border separates it from the list).
export const comboboxSearchStyle = () => ({
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  height: '2rem',
  padding: '0 0.5rem',
  margin: '0 0 0.35rem',
  fontSize: '14px',
  fontFamily: 'inherit',
  color: 'var(--color-text, #0f172a)',
  background: 'transparent',
  border: 0,
  borderBottom: '1px solid var(--color-border, #e2e8f0)',
  outline: 'none',
})

// The scrollable list region.
export const comboboxListStyle = () => ({ maxHeight: '14rem', overflowY: 'auto' })

// One option row. `active` is the keyboard/hover-highlighted row; `selected` is the chosen value.
export function comboboxItemStyle(active, selected) {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.45rem 0.6rem',
    border: 0,
    borderRadius: 'calc(var(--radius, 8px) - 3px)',
    background: active ? 'var(--color-surface, #f1f5f9)' : 'transparent',
    color: 'var(--color-text, #0f172a)',
    font: 'inherit',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    fontWeight: selected ? 600 : 400,
  }
}

// The no-results row shown when the filter matches nothing.
export const comboboxEmptyStyle = () => ({ padding: '0.6rem', fontSize: '14px', color: 'var(--color-muted, #64748b)', textAlign: 'center' })

// Static <style> for the trigger focus ring / disabled state + the search placeholder tint.
export const COMBOBOX_STYLE_TAG =
  '.vike-blocks-combobox-trigger:focus-visible{outline:none;border-color:var(--color-ring,var(--color-primary,#2563eb));box-shadow:0 0 0 3px color-mix(in srgb,var(--color-ring,var(--color-primary,#2563eb)) 25%,transparent)}' +
  '.vike-blocks-combobox-trigger:disabled{opacity:.5;cursor:default}' +
  '.vike-blocks-combobox-search::placeholder{color:var(--color-muted,#94a3b8)}'

// Filter the options by a query, matching the label OR the value case-insensitively. An empty query
// returns everything. Agnostic + pure, so it is unit-tested and shared by both renderers.
export function filterOptions(options, query) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return options
  return options.filter((o) => String(o.label).toLowerCase().includes(q) || String(o.value).toLowerCase().includes(q))
}
