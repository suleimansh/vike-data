// The `popover` block — a trigger that opens a floating panel of ARBITRARY nested content anchored to
// it (the general-purpose sibling of the dropdown menu, whose content is a fixed list of menu items).
// Interactive (local open state), built on the shared popover primitive (react/popover.jsx) it reuses:
// anchor + outside-click + Escape + edge-aware flip, no portal, dep-free. SSR renders only the trigger.
//
//   popover('Filters')
//     .content([heading('Filter posts').level(4), checkbox('Published only'), button('Apply')])
//
// The trigger defaults to a themed button labelled by `popover(label)`; `.variant()` restyles it, or
// `.trigger(block)` supplies any block as the opener. `.content([...])` is the panel body (nested
// blocks, resolved recursively like a card). `.side('top'|'bottom')` + `.align('start'|'end')` place it.
import { registerBlock } from '../core/registry.js'
import { resolvePage, collapseSection, collapseSections } from '../core/page.js'
import { normalizeSide, normalizeAlign } from './_shared.js'
import { variantKey } from './button-styles.js'

// A popover anchors below (or above) its trigger; only top/bottom are legal, defaulting to bottom.
const POPOVER_SIDES = ['top', 'bottom']

// A fluent builder for a popover block. Content sections collapse now so a nested builder (or card)
// collapses recursively; `.trigger()` collapses its single block the same way tooltip's `.on()` does.
export function popover(label) {
  let content = []
  let trigger
  let variant = 'outline'
  let side = 'bottom'
  let align = 'start'
  const self = {
    content(next = []) {
      content = collapseSections(next)
      return self
    },
    trigger(block) {
      trigger = collapseSection(block)
      return self
    },
    variant(v) {
      variant = variantKey(v)
      return self
    },
    side(s) {
      side = normalizeSide(s, POPOVER_SIDES, 'bottom')
      return self
    },
    align(a) {
      align = normalizeAlign(a)
      return self
    },
    build() {
      return {
        block: 'popover',
        ...(label !== undefined ? { label } : {}),
        content: content.map((s) => ({ ...s })),
        ...(trigger !== undefined ? { trigger: { ...trigger } } : {}),
        variant,
        side,
        align,
      }
    },
  }
  return self
}

// Resolve the trigger label (or the nested trigger block) + the content sections + the placement. The
// renderer owns the live open state; this is a pass-through of the declared panel.
registerBlock('popover', {
  resolve({ props, tables }) {
    const trigger = props.trigger ? resolvePage({ sections: [collapseSection(props.trigger)] }, tables).sections[0] : null
    return {
      label: props.label ?? 'Open',
      content: resolvePage({ sections: collapseSections(props.content) }, tables).sections,
      trigger,
      variant: variantKey(props.variant ?? 'outline'),
      side: normalizeSide(props.side, POPOVER_SIDES, 'bottom'),
      align: normalizeAlign(props.align),
    }
  },
})
