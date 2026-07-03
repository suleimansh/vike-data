// The `breadcrumb` block — the trail of pages to the current one, harvested from shadcn's breadcrumb and
// reimplemented dep-free. Built with a fluent accumulating builder (like dropdown/nav-menu):
// `.crumb(label, to)` appends a crumb (a link when `to` is set), and the LAST crumb is always rendered
// as the current page (foreground, aria-current, no link). `.separator()` overrides the chevron with a
// string. Plain `<a>` links, so it works with no client JS.
//
//   breadcrumb()
//     .crumb('Home', '/')
//     .crumb('Posts', '/posts')
//     .crumb('Edit')              // the current page
import { registerBlock } from './registry.js'

// A fluent builder for a breadcrumb. Crumbs accumulate in order; `to` makes a crumb a link.
export function breadcrumb() {
  const items = []
  let separator
  const self = {
    crumb(label, to) {
      items.push({ label, ...(to !== undefined ? { to } : {}) })
      return self
    },
    separator(text) {
      separator = text
      return self
    },
    build() {
      return {
        block: 'breadcrumb',
        items: items.map((i) => ({ ...i })),
        ...(separator !== undefined ? { separator } : {}),
      }
    },
  }
  return self
}

// Resolve the crumb list + the (optional) custom separator. The renderer links every crumb that has a
// `to` except the last (always the current page), and draws the separator between them.
registerBlock('breadcrumb', {
  resolve({ props }) {
    return {
      items: (props.items ?? []).map((i) => ({ label: i.label, ...(i.to != null ? { to: i.to } : {}) })),
      separator: props.separator ?? null,
    }
  },
})
