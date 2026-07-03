// The `tooltip` block — a small label revealed on hover / focus, harvested from shadcn's Radix tooltip
// but reimplemented dep-free + pure-CSS (see tooltip-styles). It WRAPS a trigger: pass the element it
// annotates via `.on(block)` (a button, badge, link, ...), or omit it for a default "?" info marker.
// `.side()` places the tip (top / bottom / left / right). No client JS and no local state — the tip
// shows purely via `:hover` / `:focus-within`, so it works with no JS and SSR-renders as-is.
//
//   tooltip('Save your changes').on(button('Save'))
//   tooltip('We never share your email')            // default "?" marker trigger
//   tooltip('Shown below').side('bottom').on(badge('Beta'))
import { registerBlock } from '../core/registry.js'
import { resolvePage, collapseSection as collapse } from '../core/page.js'

const SIDES = ['top', 'bottom', 'left', 'right']
// Collapse a builder to its plain descriptor (like field's nested control), so `.on(button('Save'))` works.

// A fluent builder for a tooltip block. `tooltip(text)` sets the tip; `.on()` the wrapped trigger block;
// `.side()` the placement.
export function tooltip(text) {
  let side = 'top'
  let trigger
  const self = {
    side(s) {
      side = SIDES.includes(s) ? s : 'top'
      return self
    },
    on(block) {
      trigger = collapse(block)
      return self
    },
    build() {
      return {
        block: 'tooltip',
        text: text ?? '',
        side,
        ...(trigger !== undefined ? { trigger: { ...trigger } } : {}),
      }
    },
  }
  return self
}

// Resolve the tip text + placement + the (optional) wrapped trigger block — the recursive step that
// lets a tooltip annotate any block. The renderer draws the trigger, then the CSS-revealed tip.
registerBlock('tooltip', {
  resolve({ props, tables }) {
    const trigger = props.trigger ? resolvePage({ sections: [collapse(props.trigger)] }, tables).sections[0] : null
    return {
      text: props.text ?? '',
      side: SIDES.includes(props.side) ? props.side : 'top',
      trigger,
    }
  },
})
