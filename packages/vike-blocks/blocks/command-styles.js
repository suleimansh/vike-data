// Shared, framework-agnostic styling + the filter helper for the `command` block, imported by BOTH the
// react and vue renderers so the twins can't drift. The modal box + motion come from the Overlay
// primitive; this owns the trigger (a search-field affordance + a ⌘K hint), the input row, the grouped
// list, the active item, the shortcut hint, and the empty state, plus the pure `filterCommands` helper.

// The lucide `search` glyph for the trigger + input row.
export const SEARCH_ICON = { circle: { cx: 11, cy: 11, r: 8 }, path: 'm21 21-4.3-4.3' }

// Filter the groups by a query (matching an item's label), dropping now-empty groups. Returns the
// visible `groups` AND a `flat` list of the surviving items in order (for arrow-key nav). Pure +
// agnostic, so it is unit-tested and shared by both renderers.
export function filterCommands(groups, query) {
  const q = String(query ?? '').trim().toLowerCase()
  const out = []
  const flat = []
  for (const g of groups ?? []) {
    const items = (g.items ?? []).filter((it) => !q || String(it.label).toLowerCase().includes(q))
    if (items.length) {
      out.push({ ...g, items })
      flat.push(...items)
    }
  }
  return { groups: out, flat }
}

// The trigger: a search-field-like button with the placeholder text + a ⌘K hint.
export const commandTriggerStyle = () => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.75rem',
  width: '100%',
  minWidth: '13rem',
  maxWidth: '22rem',
  height: '2.25rem',
  padding: '0 0.5rem 0 0.75rem',
  fontSize: '14px',
  fontFamily: 'inherit',
  color: 'var(--color-muted, #94a3b8)',
  background: 'var(--color-bg, #ffffff)',
  border: '1px solid var(--color-border, #e2e8f0)',
  borderRadius: 'var(--radius, 8px)',
  cursor: 'pointer',
  textAlign: 'left',
})

// The ⌘K key hint on the trigger.
export const commandKbdStyle = () => ({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  padding: '0.1rem 0.35rem',
  fontSize: '11px',
  fontFamily: 'inherit',
  color: 'var(--color-muted, #64748b)',
  background: 'var(--color-surface, #f1f5f9)',
  border: '1px solid var(--color-border, #e2e8f0)',
  borderRadius: '6px',
})

// The search-input row at the top of the panel (icon + input, a bottom border under it).
export const commandInputWrapStyle = () => ({ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0 0.9rem', borderBottom: '1px solid var(--color-border, #e2e8f0)', color: 'var(--color-muted, #94a3b8)' })
export const commandInputStyle = () => ({ flex: 1, height: '3rem', border: 0, outline: 'none', background: 'transparent', color: 'var(--color-text, #0f172a)', fontSize: '15px', fontFamily: 'inherit' })

// The scrollable results, group headings, and one selectable item (highlighted when active).
export const commandListStyle = () => ({ maxHeight: '22rem', overflowY: 'auto', padding: '0.35rem' })
export const commandGroupHeadingStyle = () => ({ padding: '0.5rem 0.6rem 0.25rem', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted, #64748b)' })
export function commandItemStyle(active) {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    padding: '0.55rem 0.6rem',
    borderRadius: 'calc(var(--radius, 8px) - 2px)',
    fontSize: '14px',
    color: 'var(--color-text, #0f172a)',
    cursor: 'pointer',
    background: active ? 'var(--color-surface, #f1f5f9)' : 'transparent',
  }
}
export const commandShortcutStyle = () => ({ flexShrink: 0, fontSize: '12px', letterSpacing: '0.05em', color: 'var(--color-muted, #94a3b8)' })
export const commandEmptyStyle = () => ({ padding: '1.5rem', textAlign: 'center', fontSize: '14px', color: 'var(--color-muted, #64748b)' })

// Static <style>: the trigger hover ring + the input placeholder tint.
export const COMMAND_STYLE_TAG =
  '.vike-blocks-cmd-trigger{transition:border-color .15s ease}' +
  '.vike-blocks-cmd-trigger:hover{border-color:var(--color-ring,var(--color-primary,#2563eb))}' +
  '.vike-blocks-cmd-input::placeholder{color:var(--color-muted,#94a3b8)}'
