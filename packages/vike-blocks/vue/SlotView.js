// The Vue renderer for the `slot` placeholder block — the Vue twin of react/SlotView.jsx. A slot
// renders its assigned children, and `from` decides their source:
//   - from:'children' -> the slot's own resolved sections (drawn with <Blocks>).
//   - from:'config'   -> a cumulative config contribution (nav / toolbar) read at render time from
//                        the layout-config injection — the vike-layouts chrome seam as a block.
// The config render is deliberately minimal (a nav is a row of links); the SOURCE wiring lives in
// the serializable IR, the fill happens here.
import { h } from 'vue'
import { Blocks } from './Blocks.js'
import { useLayoutConfig } from './LayoutView.js'
import { registerBlockRenderer } from './registry.js'

export const SlotView = {
  props: ['name', 'from', 'source', 'sections'],
  setup(props) {
    const config = useLayoutConfig()
    return () => {
      if ((props.from ?? 'children') === 'config') {
        const key = props.source ?? props.name
        const items = config[key] ?? []
        return h(
          'nav',
          { 'data-slot': 'slot', 'data-from': 'config', 'data-source': key, style: { display: 'flex', gap: '1rem', alignItems: 'center' } },
          items.map((item, i) => h('a', { key: i, href: item.href, style: { color: 'var(--color-text, #0f172a)', textDecoration: 'none', fontSize: '14px' } }, item.label)),
        )
      }
      return h('div', { 'data-slot': 'slot', 'data-from': 'children', 'data-name': props.name }, [h(Blocks, { sections: props.sections ?? [] })])
    }
  },
}

registerBlockRenderer('slot', SlotView)
