// Shared, framework-agnostic styling + keyboard-nav helpers for the `dropdown` block, imported by BOTH
// the react and vue renderers so the twins can't drift. The menu panel's box + motion come from the
// popover primitive (popoverSurfaceStyle + popoverMotionStyle); this owns the trigger look, the item /
// separator / heading rows, and the roving-focus math for arrow-key navigation.

// The `<side>-<align>` placement string the popover primitive anchors from.
export const dropdownPlacement = (side = 'bottom', align = 'start') => `${side === 'top' ? 'top' : 'bottom'}-${align === 'end' ? 'end' : 'start'}`

export function dropdownTriggerStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.85rem',
    border: '1px solid var(--color-border, #e2e8f0)',
    borderRadius: 'var(--radius, 8px)',
    background: 'var(--color-surface, #f1f5f9)',
    color: 'var(--color-text, #0f172a)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '14px',
    fontWeight: 500,
  }
}

// One selectable menu row (item or link). Disabled rows are dimmed and inert.
export function dropdownItemStyle(disabled) {
  return {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    boxSizing: 'border-box',
    gap: '0.5rem',
    padding: '0.45rem 0.6rem',
    border: 0,
    borderRadius: 'calc(var(--radius, 8px) - 3px)',
    background: 'transparent',
    color: 'var(--color-text, #0f172a)',
    font: 'inherit',
    fontSize: '14px',
    textAlign: 'left',
    textDecoration: 'none',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.45 : 1,
  }
}

export const dropdownSeparatorStyle = () => ({ height: '1px', margin: '0.35rem -0.35rem', background: 'var(--color-border, #e2e8f0)' })

export const dropdownHeadingStyle = () => ({ padding: '0.4rem 0.6rem 0.2rem', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted, #64748b)' })

// Static <style> for the item hover / focus states, on the shared class so both twins share one rule.
// The attribute value is UNQUOTED (`[aria-disabled=true]`, valid CSS) on purpose: Vue HTML-escapes the
// text of a `<style>` element, so a double-quoted `="true"` would become `=&quot;true&quot;` — an
// invalid selector that silently breaks the rule in Vue. Unquoted survives in both React and Vue.
export const DROPDOWN_STYLE_TAG =
  '.vike-blocks-menuitem:not([aria-disabled=true]):hover,.vike-blocks-menuitem:not([aria-disabled=true]):focus-visible{background:var(--color-surface,#f1f5f9);outline:none}'

// Roving focus: given the menu container element and the key, move focus among the enabled menu items.
// Returns true if it handled the key (so the caller can preventDefault). Wraps at both ends; Home/End
// jump to the edges. The popover primitive already handles Escape + outside-click close.
export function moveMenuFocus(container, key) {
  if (!container) return false
  const items = Array.from(container.querySelectorAll('[role="menuitem"]')).filter((el) => el.getAttribute('aria-disabled') !== 'true')
  if (items.length === 0) return false
  const current = items.indexOf(container.ownerDocument.activeElement)
  let next
  if (key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % items.length
  else if (key === 'ArrowUp') next = current <= 0 ? items.length - 1 : current - 1
  else if (key === 'Home') next = 0
  else if (key === 'End') next = items.length - 1
  else return false
  items[next].focus()
  return true
}
