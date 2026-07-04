// The `timeline` block — a vertical activity feed / history: a rail of tone-colored dots joined by a
// connector, each event a title + optional time + a description or nested blocks. The audit-log /
// order-status / changelog surface. A from-scratch dep-free block (Ant Timeline UX), theme-native. An
// event's `body` can be a plain string or a nested composition (resolved recursively), so a timeline
// row can hold any blocks.
//
//   timeline()
//     .item('Order placed', { time: '09:41', tone: 'success' })
//     .item('Shipped', { time: 'Mar 3', body: 'Carrier: UPS' })
//     .item('Out for delivery', { tone: 'muted', filled: false, body: [text('ETA 5pm')] })
import { registerBlock } from '../core/registry.js'
import { resolvePage, collapseSections as collapse } from '../core/page.js'

// A body is omitted, a plain string, or a nested block composition (collapsed now so nested builders
// become descriptors, like accordion's items).
const collapseBody = (body) => (Array.isArray(body) ? collapse(body) : body)

// A fluent builder for a timeline. `.item(title, opts)` appends an event; opts carries an optional
// `time`, `tone` (dot color), `filled` (solid vs ring dot), and `body` (string or nested blocks).
export function timeline() {
  const items = []
  const self = {
    item(title, { time, tone, filled, body } = {}) {
      items.push({
        title,
        ...(time !== undefined ? { time } : {}),
        ...(tone !== undefined ? { tone } : {}),
        ...(filled !== undefined ? { filled } : {}),
        ...(body !== undefined ? { body: collapseBody(body) } : {}),
      })
      return self
    },
    build() {
      return { block: 'timeline', items: items.map((i) => ({ ...i })) }
    },
  }
  return self
}

// Resolve each event: default the tone + dot fill, and resolve a nested-block body into view-models (a
// string body passes through). `blocks` tells the renderer which body shape it got. The renderer draws
// the rail (dots + connectors) and the rows.
registerBlock('timeline', {
  resolve({ props, tables }) {
    const items = (props.items ?? []).map((it) => {
      const nested = Array.isArray(it.body)
      return {
        title: it.title,
        time: it.time ?? null,
        tone: it.tone ?? 'default',
        filled: it.filled ?? true,
        blocks: nested,
        body: nested ? resolvePage({ sections: collapse(it.body) }, tables).sections : (it.body ?? null),
      }
    })
    return { items }
  },
})
