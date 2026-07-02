// The React renderer for the `slot` placeholder block — the #401 "slots as elements" seam. A slot
// renders its assigned children, and `from` decides where they come from:
//   - from:'children' -> the slot's own resolved sections (drawn with <Blocks>, like any container).
//   - from:'config'   -> a cumulative config contribution read at render time (the vike-layouts
//                        chrome seam expressed as a block). A nav-shaped value (array of {href})
//                        renders as an active-aware nav; any other value (a logo string, a userMenu
//                        node) renders as-is. `only: 'start'|'end'` narrows a nav to the
//                        leading/trailing items (logo-side vs user-menu-side).
//   - from:'content'  -> the live page body a wrapper handed to LayoutView (the app-frame case).
import { Blocks } from './Blocks.jsx'
import { useLayoutConfig, useLayoutContent, NavRegion } from './LayoutView.jsx'
import { registerBlockRenderer } from './registry.js'

// A value is nav-shaped when it is an array of link-ish items (objects with an href/label).
const isNav = (v) => Array.isArray(v) && v.every((i) => i && typeof i === 'object' && ('href' in i || 'label' in i))

export function SlotView({ name, from = 'children', source, only, vertical, sections = [] }) {
  const config = useLayoutConfig()
  const content = useLayoutContent()

  if (from === 'content') {
    return <div data-slot="slot" data-from="content">{content}</div>
  }

  if (from === 'config') {
    const key = source ?? name
    const value = config[key]
    if (isNav(value)) {
      const items = only === 'start' ? value.filter((i) => !i.end) : only === 'end' ? value.filter((i) => i.end) : value
      if (items.length === 0) return null
      return <NavRegion items={items} vertical={vertical ?? config.navVertical} />
    }
    // A non-nav contribution (logo / userMenu / a rendered node): draw it directly.
    return <span data-slot="slot" data-from="config" data-source={key}>{value ?? null}</span>
  }

  return (
    <div data-slot="slot" data-from="children" data-name={name}>
      <Blocks sections={sections} />
    </div>
  )
}

registerBlockRenderer('slot', SlotView)
