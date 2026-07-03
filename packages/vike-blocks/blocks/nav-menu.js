// The `nav-menu` block — a navigation menu: a horizontal bar of top-level links and dropdown sections.
// Interactive (one section open at a time), built with a fluent accumulating builder (like dropdown).
// `.link(label, to)` appends a plain top-level link; `.group(label, links)` appends a section whose
// trigger opens a dropdown of links anchored below it. A group link is `{ label, to, description? }`, a
// `[label, to]` / `[label, to, description]` tuple, so a section can show a title + a line of context
// (the shadcn navigation-menu layout). The renderer reuses the popover primitive (anchor + outside-click
// + Escape) and the dropdown's roving arrow-key nav; navigation is a real <a>, mutations are #385.
//
//   navMenu()
//     .link('Home', '/')
//     .group('Products', [
//       { label: 'Analytics', to: '/products/analytics', description: 'Track everything' },
//       ['Billing', '/products/billing', 'Plans and invoices'],
//     ])
//     .link('Docs', '/docs')
import { registerBlock } from '../core/registry.js'

// Normalize one group link (object or tuple) to { label, to, description }.
function normLink(l) {
  if (Array.isArray(l)) return { label: l[0], to: l[1], ...(l[2] != null ? { description: l[2] } : {}) }
  return { label: l.label, ...(l.to != null ? { to: l.to } : {}), ...(l.description != null ? { description: l.description } : {}) }
}

// A fluent builder for a navigation menu. Links and groups accumulate in bar order.
export function navMenu() {
  const items = []
  const self = {
    link(label, to) {
      items.push({ type: 'link', label, ...(to !== undefined ? { to } : {}) })
      return self
    },
    group(label, links = []) {
      items.push({ type: 'group', label, links: links.map(normLink) })
      return self
    },
    build() {
      return { block: 'nav-menu', items: items.map((i) => ({ ...i, ...(i.links ? { links: i.links.map((l) => ({ ...l })) } : {}) })) }
    },
  }
  return self
}

// Resolve the bar items. The renderer owns which section is open; this is a pass-through of the
// declared links + groups.
registerBlock('nav-menu', {
  resolve({ props }) {
    return {
      items: (props.items ?? []).map((i) => ({ ...i, ...(i.links ? { links: i.links.map((l) => ({ ...l })) } : {}) })),
    }
  },
})
