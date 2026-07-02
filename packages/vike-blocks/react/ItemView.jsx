// The React renderer for the `item` block — a static, theme-native list row: an optional leading
// media chip, a title + muted description column, and an optional muted trailing note. The layout
// comes from the shared item-styles module, so this stays a thin binding and can't drift from the
// Vue twin.
import { registerBlockRenderer } from './registry.js'
import { itemRowStyle, itemMediaStyle, itemBodyStyle, itemTitleStyle, itemDescriptionStyle, itemTrailingStyle } from '../item-styles.js'

export function ItemView({ title, description, media, trailing }) {
  return (
    <div data-slot="item" style={itemRowStyle}>
      {media != null && <span data-slot="item-media" style={itemMediaStyle}>{media}</span>}
      <span style={itemBodyStyle}>
        {title != null && <span style={itemTitleStyle}>{title}</span>}
        {description != null && <span style={itemDescriptionStyle}>{description}</span>}
      </span>
      {trailing != null && <span data-slot="item-trailing" style={itemTrailingStyle}>{trailing}</span>}
    </div>
  )
}

registerBlockRenderer('item', ItemView)
