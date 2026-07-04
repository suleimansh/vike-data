// Small framework-agnostic helpers shared by the react + vue view twins for blocks that have no
// dedicated *-styles module (slot, layout), so the pure logic lives once instead of per framework.

// True when a config value is a nav-item list (an array of { href | label } objects) — the SlotView
// discriminant for rendering a nav region vs a raw value.
export const isNav = (v) =>
  Array.isArray(v) && v.every((i) => i && typeof i === 'object' && ('href' in i || 'label' in i))

// The stable region order for the neutral stack layout: header, main, footer first (only when
// present), then any extra regions in declaration order.
export function stackRegionOrder(slots) {
  const known = ['header', 'main', 'footer']
  return [...known.filter((n) => slots[n]), ...Object.keys(slots).filter((n) => !known.includes(n))]
}

// Static <style> for the `docs` layout shell, shared by the react + vue twins so the responsive rules
// live once. The header's first child (the logo) is pushed left so the rest of the row sits on the
// right; the `mobileMenu` region is hidden on desktop. Below the breakpoint the sidebar column drops
// out, the article gets tighter padding, and the mobile menu appears (fill it with a dialog holding
// the same doc-nav).
export const DOCS_SHELL_STYLE_TAG =
  '.vike-blocks-docs-header>:first-child{margin-right:auto}' +
  '.vike-blocks-docs-mobile{display:none}' +
  '@media (max-width:860px){' +
  '.vike-blocks-docs-body{grid-template-columns:minmax(0,1fr)!important}' +
  '.vike-blocks-docs-sidebar{display:none!important}' +
  '.vike-blocks-docs-article{padding:1.5rem 1.25rem!important}' +
  '.vike-blocks-docs-mobile{display:block}}'
