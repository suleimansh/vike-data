// The `collapsible` block — a single expand/collapse disclosure: one trigger toggles one panel of
// nested blocks, the single-panel sibling of `accordion` (which manages many items). Harvested from
// shadcn's Radix Collapsible and reimplemented dep-free: the same measured height-morph + fade the
// accordion/tabs renderers use, no motion lib, styled on the `var(--color-*)` contract. Whether it's
// open is local UI state in the renderer. The panel holds any blocks, so collapsibles compose.
//
//   collapsible('Details', [text('The fine print.')])              // starts closed
//   collapsible('Advanced', [field('Key').control(input())]).open()   // starts open
import { registerBlock } from '../core/registry.js'
import { containerResolve, collapseSections as collapse } from '../core/page.js'

// A fluent builder: the trigger label + the panel's blocks (collapsed now so a nested builder becomes
// a descriptor). `.open()` starts it expanded.
export function collapsible(label, sections = []) {
  let open = false
  const self = {
    open(v = true) {
      open = v
      return self
    },
    build() {
      return { block: 'collapsible', label, sections: collapse(sections), ...(open ? { open: true } : {}) }
    },
  }
  return self
}

// Resolve the panel's blocks into view-models (the recursive step) and the initial open state. The
// renderer draws the trigger + panel and owns the live open/closed state; `open` is only the start.
registerBlock('collapsible', {
  category: 'layout',
  summary: "A single show/hide disclosure around nested blocks.",
  container: true,
  example: "collapsible('Details', [text('The fine print.')])",
  resolve({ props, tables }) {
    return {
      label: props.label ?? '',
      open: props.open ?? false,
      sections: containerResolve(props.sections, tables),
    }
  },
})
