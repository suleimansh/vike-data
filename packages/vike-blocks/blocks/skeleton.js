// The `skeleton` block — a pulsing placeholder shown while content loads, harvested from shadcn's
// skeleton and reimplemented dep-free (pure-CSS pulse, no JS, no state). `skeleton()` is one bar;
// `.width()` / `.height()` size it (a number is px, a string like '100%' / '1rem' passes through),
// `.radius()` rounds it ('full' for a pill), `.circle(size)` is a round avatar placeholder, and
// `.lines(n)` renders a stack of text bars (the last one shorter).
//
//   skeleton().circle(40)                          // avatar placeholder
//   skeleton().height('1.5rem').width('60%')       // a title bar
//   skeleton().lines(3)                            // a paragraph placeholder
import { registerBlock } from '../core/registry.js'

// A fluent builder for a skeleton.
export function skeleton() {
  let width
  let height
  let radius
  let lines
  const self = {
    width(w) {
      width = w
      return self
    },
    height(h) {
      height = h
      return self
    },
    radius(r) {
      radius = r
      return self
    },
    // Shorthand for a round placeholder: a `size` square with a full radius.
    circle(size) {
      width = size
      height = size
      radius = 'full'
      return self
    },
    lines(n) {
      lines = n
      return self
    },
    build() {
      return {
        block: 'skeleton',
        ...(width !== undefined ? { width } : {}),
        ...(height !== undefined ? { height } : {}),
        ...(radius !== undefined ? { radius } : {}),
        ...(lines !== undefined ? { lines } : {}),
      }
    },
  }
  return self
}

// Resolve the box dimensions + line count. A null radius lets the renderer fall back to the theme
// radius. The renderer draws one bar, or a stack when `lines > 1`.
registerBlock('skeleton', {
  category: 'feedback',
  summary: "A loading placeholder shape.",
  example: "skeleton().lines(3)",
  resolve({ props }) {
    return {
      width: props.width ?? '100%',
      height: props.height ?? '1rem',
      radius: props.radius ?? null,
      lines: props.lines ?? 1,
    }
  },
})
