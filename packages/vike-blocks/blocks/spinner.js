// The `spinner` block — a dep-free, theme-native loading spinner: a ring with a rotating arc for
// INDETERMINATE waits, the companion to `skeleton` (a placeholder) and `progress` (a measured bar). A
// from-scratch pure-CSS spin (no JS/state, SSR-perfect) that respects `prefers-reduced-motion`.
// `spinner()` is a 20px ring; `.size(px)` resizes it, `.tone()` colors the arc, `.label()` adds a
// caption beside it (which also becomes the accessible name).
//
//   spinner()                                   // a bare 20px spinner
//   spinner().size(32).label('Loading orders...')
//   spinner().tone('danger')
import { registerBlock } from '../core/registry.js'

// A fluent builder for a spinner.
export function spinner() {
  let size = 20
  let tone
  let label
  const self = {
    size(px) {
      size = px
      return self
    },
    tone(token) {
      tone = token
      return self
    },
    label(text) {
      label = text
      return self
    },
    build() {
      return {
        block: 'spinner',
        size,
        ...(tone !== undefined ? { tone } : {}),
        ...(label !== undefined ? { label } : {}),
      }
    },
  }
  return self
}

// Resolve the ring size + a border thickness scaled to it (so a big spinner isn't a hairline and a
// tiny one keeps a 2px minimum), the tone, and the optional label. The renderer draws the ring (with
// a status role) and the caption.
registerBlock('spinner', {
  resolve({ props }) {
    const size = props.size ?? 20
    return {
      size,
      thickness: Math.max(2, Math.round(size / 10)),
      tone: props.tone ?? 'default',
      label: props.label ?? null,
    }
  },
})
