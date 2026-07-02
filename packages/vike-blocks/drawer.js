// The `drawer` block — an edge-anchored sliding panel with a drag-to-dismiss grabber handle. It is a
// sheet's close cousin: same overlay primitive (portal + focus-trap + Escape + outside-click +
// scroll-lock + enter/exit), same edge-slide geometry, but it defaults to the BOTTOM edge and adds a
// handle you can drag toward the edge to flick it closed (the drawer's defining affordance). A trigger
// button opens it; open/close + the drag are local UI state (a data action is the actions axis #385).
//
//   drawer()
//     .trigger('Menu')
//     .side('bottom')
//     .title('Quick actions')
//     .sections([item('Share'), item('Rename'), item('Delete')])
//
// The body sections are ordinary blocks (built-ins or custom), so drawers compose recursively.
import { registerBlock } from './registry.js'
import { resolvePage } from './page.js'

const SIDES = ['bottom', 'top', 'left', 'right']

// Collapse a section that is a builder to its plain descriptor (definePage does this for top-level
// sections; the body sections need the same so `resolve` gets `{ block, ...props }` objects).
const collapse = (sections) => (sections ?? []).map((s) => (typeof s?.build === 'function' ? s.build() : s))

// A fluent builder for a drawer block. `.title()` / `.description()` head the panel; `.trigger()` is
// the opening button's label; `.side()` anchors the panel (bottom | top | left | right, default
// bottom); `.sections()` is the body (nested blocks, collapsed now so a nested drawer collapses
// recursively); `.defaultOpen()` opens it on first render.
export function drawer() {
  let title = ''
  let description
  let trigger = 'Open'
  let side = 'bottom'
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
      side = SIDES.includes(value) ? value : 'bottom'
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
        block: 'drawer',
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

// Resolve the body sections into serializable view-models (the recursive step that makes the drawer a
// container), and pass the chrome through. The renderer owns the live open/closed + drag state;
// `defaultOpen` is only the INITIAL state.
registerBlock('drawer', {
  resolve({ props, tables }) {
    const sections = resolvePage({ sections: collapse(props.sections) }, tables).sections
    return {
      title: props.title ?? '',
      description: props.description ?? null,
      trigger: props.trigger ?? 'Open',
      side: SIDES.includes(props.side) ? props.side : 'bottom',
      sections,
      defaultOpen: props.defaultOpen ?? false,
    }
  },
})
