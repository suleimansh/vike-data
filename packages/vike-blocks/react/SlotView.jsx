// The React renderer for the `slot` placeholder block — the #401 "slots as elements" seam. A slot
// renders its assigned children, and `from` decides where they come from:
//   - from:'children' -> the slot's own resolved sections (drawn with <Blocks>, like any container).
//   - from:'config'   -> a cumulative config contribution read at render time (nav / toolbar) from
//                        LayoutConfigContext. This is the vike-layouts chrome seam expressed as a
//                        block: an extension contributes a nav item into the config, and every page
//                        that drops `slot('nav').from('config')` shows it — no page edit per item.
//
// The config render here is deliberately minimal (a nav is a row of links). A real vike-nav block
// would own the rich rendering; the point of the spike is that the SOURCE wiring lives in the IR
// and stays serializable, while the fill happens in the renderer.
import { Blocks } from './Blocks.jsx'
import { useLayoutConfig } from './LayoutView.jsx'
import { registerBlockRenderer } from './registry.js'

export function SlotView({ name, from = 'children', source, sections = [] }) {
  const config = useLayoutConfig()

  if (from === 'config') {
    const key = source ?? name
    const items = config[key] ?? []
    return (
      <nav data-slot="slot" data-from="config" data-source={key} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {items.map((item, i) => (
          <a key={i} href={item.href} style={{ color: 'var(--color-text, #0f172a)', textDecoration: 'none', fontSize: 14 }}>
            {item.label}
          </a>
        ))}
      </nav>
    )
  }

  return (
    <div data-slot="slot" data-from="children" data-name={name}>
      <Blocks sections={sections} />
    </div>
  )
}

registerBlockRenderer('slot', SlotView)
