// The `sheet` block — a side panel overlay: a full-edge drawer anchored to a screen edge that holds a
// nested composition of blocks. Interactive like `dialog`, and built on the SAME shared overlay
// primitive (portal + focus-trap + Escape + outside-click + scroll-lock + enter/exit); a sheet differs
// only in anchoring to an edge and sliding in from it. A trigger button opens it; open/close is local
// UI state in the renderer (a data action is the actions axis #385).
//
//   sheet()
//     .trigger('Filters')
//     .side('right')
//     .title('Filters')
//     .description('Narrow the results.')
//     .sections([field('Status').control(input()), field('Owner').control(input())])
//
// The body sections are ordinary blocks (built-ins or custom), so sheets compose recursively.
import { registerBlock } from '../core/registry.js'
import { resolvePage } from '../core/page.js'

const SIDES = ['right', 'left', 'top', 'bottom']

// Collapse a section that is a builder to its plain descriptor (definePage does this for top-level
// sections; the body sections need the same so `resolve` gets `{ block, ...props }` objects).
const collapse = (sections) => (sections ?? []).map((s) => (typeof s?.build === 'function' ? s.build() : s))

// A fluent builder for a sheet block. `.title()` / `.description()` head the panel; `.trigger()` is
// the opening button's label; `.side()` anchors the panel (right | left | top | bottom, default
// right); `.sections()` is the body (nested blocks, collapsed now so a nested sheet collapses
// recursively); `.defaultOpen()` opens it on first render.
export function sheet() {
  let title = ''
  let description
  let trigger = 'Open'
  let side = 'right'
  let sections = []
  let defaultOpen = false
  const self = {
    title(value) {
      title = value
      return self
    },
    description(value) {
      description = value
      return self
    },
    trigger(label) {
      trigger = label
      return self
    },
    side(value) {
      side = SIDES.includes(value) ? value : 'right'
      return self
    },
    sections(list) {
      sections = collapse(list)
      return self
    },
    defaultOpen(value = true) {
      defaultOpen = !!value
      return self
    },
    build() {
      return {
        block: 'sheet',
        title,
        trigger,
        side,
        sections: sections.map((s) => ({ ...s })),
        ...(description !== undefined ? { description } : {}),
        ...(defaultOpen ? { defaultOpen: true } : {}),
      }
    },
  }
  return self
}

// Resolve the body sections into serializable view-models (the recursive step that makes the sheet a
// container), and pass the chrome through. The renderer owns the live open/closed state; `defaultOpen`
// is only the INITIAL state.
registerBlock('sheet', {
  resolve({ props, tables }) {
    const sections = resolvePage({ sections: collapse(props.sections) }, tables).sections
    return {
      title: props.title ?? '',
      description: props.description ?? null,
      trigger: props.trigger ?? 'Open',
      side: SIDES.includes(props.side) ? props.side : 'right',
      sections,
      defaultOpen: props.defaultOpen ?? false,
    }
  },
})
