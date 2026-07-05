// The `context-menu` block — a right-click menu anchored at the cursor. The last member of the menu
// family (dropdown / nav-menu / command already ship). Unlike `dropdown` (a menu anchored BELOW a
// trigger via the popover primitive) and the modal overlays, a context menu is non-modal and
// cursor-positioned: you right-click a region and the menu opens where the pointer is, flipping at the
// viewport edge. It shares the dropdown's menu chrome (item / separator / heading rows + roving
// arrow-key focus); the only new part is the cursor placement (see context-menu-styles).
//
//   contextMenu()
//     .item('Open', { to: '/file/1' })
//     .item('Rename')
//     .separator()
//     .item('Delete', { disabled: true })
//     .on(card('Right-click this card'))            // the region that opens the menu
//
// Items mirror `dropdown`: `.item(label, { to, disabled })` (a link when `to` is set, else a button —
// the mutating behaviour is the actions axis #385), `.separator()`, `.heading(text)`. `.on(block)` wraps
// the right-click region (like tooltip); omit it for a default affordance box.
import { registerBlock } from '../core/registry.js'
import { resolvePage, collapseSection as collapse } from '../core/page.js'

// A fluent accumulating builder (like dropdown). Items push in order; `.on()` sets the region block.
export function contextMenu() {
  const items = []
  let trigger
  const self = {
    item(label, opts = {}) {
      items.push({ type: 'item', label, ...(opts.to !== undefined ? { to: opts.to } : {}), ...(opts.disabled ? { disabled: true } : {}) })
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
    on(block) {
      trigger = collapse(block)
      return self
    },
    build() {
      return {
        block: 'context-menu',
        items: items.map((i) => ({ ...i })),
        ...(trigger !== undefined ? { trigger: { ...trigger } } : {}),
      }
    },
  }
  return self
}

// Resolve the item list + the (optional) wrapped region block (the recursive step, so you can
// right-click any block). The renderer owns the live open state + cursor position; this is a
// pass-through of the declared menu.
registerBlock('context-menu', {
  resolve({ props, tables }) {
    const trigger = props.trigger ? resolvePage({ sections: [collapse(props.trigger)] }, tables).sections[0] : null
    return {
      items: (props.items ?? []).map((i) => ({ ...i })),
      trigger,
    }
  },
})
