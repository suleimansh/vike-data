// The React renderer for the `description-list` block — a key-value metadata grid. Theme-native, static
// (no state), so it renders fully on the server. Semantic markup: a <dl> grid whose cells each group a
// <dt> (term) and <dd> (value). A value is a plain string OR nested blocks (drawn with <Blocks>), so a
// value can be a status badge, a link, or any composition. The grid / cell / responsive styles live in
// the shared styles module, so this can't drift from the Vue twin.
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import { dlRootStyle, dlTitleStyle, dlGridStyle, dlItemStyle, dlTermStyle, dlValueStyle, DL_STYLE_TAG } from '../blocks/description-list-styles.js'

export function DescriptionListView({ items = [], columns = 2, bordered = false, title = null }) {
  return (
    <div data-slot="description-list" style={dlRootStyle()}>
      <style>{DL_STYLE_TAG}</style>
      {title && <div style={dlTitleStyle()}>{title}</div>}
      <dl className="vike-blocks-dl" style={dlGridStyle(columns, bordered)}>
        {items.map((it, i) => (
          <div key={i} style={dlItemStyle(it.span ?? 1, bordered)}>
            <dt style={dlTermStyle()}>{it.term}</dt>
            <dd style={dlValueStyle()}>{it.blocks ? <Blocks sections={it.value} /> : it.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

registerBlockRenderer('description-list', DescriptionListView)
