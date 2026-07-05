// The `dropdown` block — a dropdown menu: a trigger that opens a floating menu of items anchored below
// it. Interactive (local open state), built with a fluent accumulating builder (like radio/tabs).
// `dropdown(triggerLabel)` sets the trigger; `.item(label, { to, disabled })` appends a menu item (a
// link when `to` is set, else a button — the mutating behaviour is the actions axis #385);
// `.separator()` a divider; `.heading(text)` a non-interactive group label; `.align('start'|'end')` and
// `.side('bottom'|'top')` place the menu. The renderer reuses the popover primitive (anchor +
// outside-click + Escape) and adds arrow-key navigation between items.
//
//   dropdown('Options')
//     .heading('Account')
//     .item('Profile', { to: '/profile' })
//     .item('Settings', { to: '/settings' })
//     .separator()
//     .item('Sign out')
import { registerBlock } from '../core/registry.js'
import { normalizeSide, normalizeAlign } from './_shared.js'

// A dropdown menu anchors below (or above) its trigger; only top/bottom are legal, defaulting to bottom.
const DROPDOWN_SIDES = ['top', 'bottom']

// A fluent builder for a dropdown menu. Items accumulate in order; `to` makes an item a link.
export function dropdown(label) {
  const items = []
  let align = 'start'
  let side = 'bottom'
  const self = {
    item(itemLabel, opts = {}) {
      items.push({ type: 'item', label: itemLabel, ...(opts.to !== undefined ? { to: opts.to } : {}), ...(opts.disabled ? { disabled: true } : {}) })
      return self
    },
    separator() {
      items.push({ type: 'separator' })
      return self
    },
    heading(text) {
      items.push({ type: 'heading', label: text })
      return self
    },
    align(a) {
      align = normalizeAlign(a)
      return self
    },
    side(s) {
      side = normalizeSide(s, DROPDOWN_SIDES, 'bottom')
      return self
    },
    build() {
      return {
        block: 'dropdown',
        ...(label !== undefined ? { label } : {}),
        items: items.map((i) => ({ ...i })),
        align,
        side,
      }
    },
  }
  return self
}

// Resolve the trigger label + the item list + the placement. The renderer owns the live open state;
// this stays a pass-through of the declared menu.
registerBlock('dropdown', {
  category: 'overlay',
  summary: "A dropdown menu of actions and links.",
  example: "dropdown('Options').item('Profile', { to: '/profile' }).separator().item('Sign out')",
  resolve({ props }) {
    return {
      label: props.label ?? 'Menu',
      items: (props.items ?? []).map((i) => ({ ...i })),
      align: normalizeAlign(props.align),
      side: normalizeSide(props.side, DROPDOWN_SIDES, 'bottom'),
    }
  },
})
