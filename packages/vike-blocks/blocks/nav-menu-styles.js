// Shared, framework-agnostic styling for the `nav-menu` block, imported by BOTH the react and vue
// renderers so the twins can't drift. The dropdown panel's box + motion come from the popover primitive
// (popoverSurfaceStyle + popoverMotionStyle) and its keyboard nav from the dropdown's moveMenuFocus;
// this owns the bar, the top-level links, the group triggers, and the two-line group-link rows.

export function navRootStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.35rem',
    border: '1px solid var(--color-border, #e2e8f0)',
    borderRadius: 'var(--radius, 10px)',
    background: 'var(--color-bg, #ffffff)',
    font: 'inherit',
    fontSize: '14px',
  }
}

// A top-level bar entry (link or group trigger) shares this base look; the trigger adds a caret + the
// open background.
function barItemStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.45rem 0.7rem',
    border: 0,
    borderRadius: 'calc(var(--radius, 10px) - 4px)',
    background: 'transparent',
    color: 'var(--color-text, #0f172a)',
    font: 'inherit',
    fontSize: '14px',
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
  }
}

export const navLinkStyle = () => barItemStyle()

// The group trigger; when its section is open it takes the surface background so the bar shows what's active.
export function navTriggerStyle(open) {
  return { ...barItemStyle(), background: open ? 'var(--color-surface, #f1f5f9)' : 'transparent' }
}

// One link row inside a group's dropdown: a title and an optional line of context.
export function navGroupLinkStyle() {
  return {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '0.5rem 0.6rem',
    borderRadius: 'calc(var(--radius, 10px) - 4px)',
    color: 'var(--color-text, #0f172a)',
    textDecoration: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    background: 'transparent',
    border: 0,
    font: 'inherit',
  }
}

export const navGroupLinkTitleStyle = () => ({ fontSize: '14px', fontWeight: 600 })
export const navGroupLinkDescStyle = () => ({ fontSize: '13px', color: 'var(--color-muted, #64748b)', marginTop: '0.1rem', lineHeight: 1.35 })

// The dropdown panel is a touch wider than a plain menu, to fit the descriptions.
export const navGroupPanelStyle = () => ({ minWidth: '15rem' })

// Static <style> for the bar/menu hover + focus states, on the shared classes so both twins share one rule.
export const NAV_STYLE_TAG =
  '.vike-blocks-navitem:hover,.vike-blocks-navitem:focus-visible{background:var(--color-surface,#f1f5f9);outline:none}' +
  '.vike-blocks-navlink:hover,.vike-blocks-navlink:focus-visible{background:var(--color-surface,#f1f5f9);outline:none}'
