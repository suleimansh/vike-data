// Shared, framework-agnostic chrome for the `data-table` block's toolbar (search box, "Columns" menu,
// selection bar), imported by BOTH renderers so they can't drift. The table body itself reuses the
// `table` chrome (tableCell / tableHeader / formatValue / compareRows / rowMatchesQuery in
// table-styles). Theme-native; the search focus ring rides the `vike-blocks-dtsearch` class +
// DATA_TABLE_STYLE_TAG.

// The toolbar row above the table: the search box on the left, the columns menu on the right.
export const dataTableToolbarStyle = () => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.6rem' })

// The search input.
export function dataTableSearchStyle() {
  return {
    width: '100%',
    maxWidth: '18rem',
    height: '2.25rem',
    padding: '0 0.7rem',
    border: '1px solid var(--color-border, #cbd5e1)',
    borderRadius: 'var(--radius, 8px)',
    background: 'var(--color-bg, #ffffff)',
    color: 'var(--color-text, #0f172a)',
    font: 'inherit',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  }
}

// The "Columns" trigger button (an outline button, like the popover block's default trigger).
export function dataTableColumnsButtonStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    height: '2.25rem',
    padding: '0 0.75rem',
    border: '1px solid var(--color-border, #cbd5e1)',
    borderRadius: 'var(--radius, 8px)',
    background: 'var(--color-bg, #ffffff)',
    color: 'var(--color-text, #0f172a)',
    font: 'inherit',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  }
}

// One row in the columns menu: a checkbox + the column label.
export const dataTableColumnItemStyle = () => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  width: '100%',
  padding: '0.35rem 0.5rem',
  fontSize: '14px',
  borderRadius: 'calc(var(--radius, 8px) - 2px)',
  cursor: 'pointer',
  color: 'var(--color-text, #0f172a)',
})

// The selection bar shown when rows are selected (a count + it reads muted).
export const dataTableSelectionStyle = () => ({ fontSize: '13px', color: 'var(--color-muted, #64748b)', margin: '0.5rem 0.1rem 0' })

// The narrow checkbox column (header + cell) so it doesn't take a full column's width.
export const dataTableCheckboxCellStyle = () => ({ width: '1px', whiteSpace: 'nowrap' })

// A theme-accented native checkbox (accentColor tints the check to the primary color).
export const dataTableCheckboxStyle = () => ({ width: '15px', height: '15px', accentColor: 'var(--color-primary, #2563eb)', cursor: 'pointer', verticalAlign: 'middle' })

// The static <style> for the search focus ring + the columns-menu row hover.
export const DATA_TABLE_STYLE_TAG =
  '.vike-blocks-dtsearch:focus{border-color:var(--color-ring,var(--color-primary,#2563eb));box-shadow:0 0 0 2px color-mix(in srgb,var(--color-ring,var(--color-primary,#2563eb)) 30%,transparent)}' +
  '.vike-blocks-dtcol:hover{background:color-mix(in srgb,var(--color-muted,#64748b) 12%,transparent)}'
