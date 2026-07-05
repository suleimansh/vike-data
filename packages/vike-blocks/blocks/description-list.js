// The `description-list` block — a key-value / metadata display (Ant Descriptions): a responsive grid of
// term/value pairs. The record-detail / metadata / summary surface (pairs with the vike-crud record
// view). A from-scratch, dep-free block, theme-native. It is static (no client state), so it renders
// fully on the server with no hydration concern. A value is a plain string OR nested blocks (resolved
// recursively, like timeline's body), so a value can be a status badge, a link, or any composition.
//
//   descriptionList()
//     .title('Order #1024')
//     .item('Status', badge('Paid').tone('success'))
//     .item('Customer', 'Ada Lovelace')
//     .item('Shipping address', '12 Analytical Way, London', { span: 2 })
//     .columns(2)
//     .bordered()
//
// `.item(term, value, { span })` appends a pair (span lets one item take several columns); `.columns(n)`
// sets the grid width; `.bordered()` draws the table-like cell borders; `.title()` adds a heading.
import { registerBlock } from '../core/registry.js'
import { resolvePage, collapseSections as collapse } from '../core/page.js'

// A value is a plain string (passes through) or a nested block composition (collapsed now so nested
// builders become descriptors, resolved later).
const collapseValue = (value) => (Array.isArray(value) ? collapse(value) : value)

// A fluent builder. Items accumulate in order; columns / bordered / title are chainable settings.
export function descriptionList() {
  const items = []
  let columns = 2
  let bordered = false
  let title
  const self = {
    item(term, value, opts = {}) {
      items.push({ term, value: collapseValue(value), ...(opts.span ? { span: opts.span } : {}) })
      return self
    },
    columns(n) {
      columns = Math.max(1, Math.floor(n) || 1)
      return self
    },
    bordered(value = true) {
      bordered = value !== false
      return self
    },
    title(text) {
      title = text
      return self
    },
    build() {
      return {
        block: 'description-list',
        items: items.map((i) => ({ ...i })),
        columns,
        ...(bordered ? { bordered: true } : {}),
        ...(title !== undefined ? { title } : {}),
      }
    },
  }
  return self
}

// Resolve each pair: a string value passes through, a nested-block value resolves into view-models
// (`blocks` tells the renderer which shape it got), and a span is clamped to the column count. The
// renderer draws the <dl> grid + the optional title.
registerBlock('description-list', {
  resolve({ props, tables }) {
    const columns = Math.max(1, Math.floor(props.columns) || 1)
    const items = (props.items ?? []).map((it) => {
      const nested = Array.isArray(it.value)
      return {
        term: it.term ?? '',
        blocks: nested,
        value: nested ? resolvePage({ sections: collapse(it.value) }, tables).sections : (it.value ?? null),
        span: Math.min(columns, Math.max(1, it.span ?? 1)),
      }
    })
    return { items, columns, bordered: props.bordered === true, title: props.title ?? null }
  },
})
