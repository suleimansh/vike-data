// The Vue renderer for the `slot` placeholder block — the Vue twin of react/SlotView.jsx. A slot
// renders its assigned children, and `from` decides where they come from:
//   - from:'children' -> the slot's own resolved sections (drawn with <Blocks>).
//   - from:'config'   -> a cumulative config contribution (the vike-layouts chrome seam as a block).
//                        A nav-shaped value renders as an active-aware nav; any other value (logo /
//                        userMenu) renders as-is. `only:'start'|'end'` narrows a nav.
//   - from:'content'  -> the live page body a wrapper handed to LayoutView.
import { h } from 'vue'
import { Blocks } from './Blocks.js'
import { useLayoutConfig, useLayoutContent, NavRegion } from './LayoutView.js'
import { registerBlockRenderer } from './registry.js'

const isNav = (v) => Array.isArray(v) && v.every((i) => i && typeof i === 'object' && ('href' in i || 'label' in i))

export const SlotView = {
  props: ['name', 'from', 'source', 'only', 'vertical', 'sections'],
  setup(props) {
    const config = useLayoutConfig()
    const content = useLayoutContent()
    return () => {
      const from = props.from ?? 'children'
      if (from === 'content') {
        return h('div', { 'data-slot': 'slot', 'data-from': 'content' }, content.value)
      }
      if (from === 'config') {
        const key = props.source ?? props.name
        const value = config.value?.[key]
        if (isNav(value)) {
          const items = props.only === 'start' ? value.filter((i) => !i.end) : props.only === 'end' ? value.filter((i) => i.end) : value
          if (items.length === 0) return null
          return h(NavRegion, { items, vertical: props.vertical ?? config.value?.navVertical })
        }
        return h('span', { 'data-slot': 'slot', 'data-from': 'config', 'data-source': key }, value ?? null)
      }
      return h('div', { 'data-slot': 'slot', 'data-from': 'children', 'data-name': props.name }, [h(Blocks, { sections: props.sections ?? [] })])
    }
  },
}

registerBlockRenderer('slot', SlotView)
