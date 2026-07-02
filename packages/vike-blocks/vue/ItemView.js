// The Vue renderer for the `item` block — the Vue twin of react/ItemView.jsx, a static, theme-native
// list row: an optional leading media chip, a title + muted description column, and an optional muted
// trailing note. The layout is shared with the React renderer via item-styles, so they can't drift.
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { itemRowStyle, itemMediaStyle, itemBodyStyle, itemTitleStyle, itemDescriptionStyle, itemTrailingStyle } from '../item-styles.js'

export const ItemView = (props) =>
  h('div', { 'data-slot': 'item', style: itemRowStyle }, [
    props.media != null ? h('span', { 'data-slot': 'item-media', style: itemMediaStyle }, props.media) : null,
    h('span', { style: itemBodyStyle }, [
      props.title != null ? h('span', { style: itemTitleStyle }, props.title) : null,
      props.description != null ? h('span', { style: itemDescriptionStyle }, props.description) : null,
    ]),
    props.trailing != null ? h('span', { 'data-slot': 'item-trailing', style: itemTrailingStyle }, props.trailing) : null,
  ])
ItemView.props = ['title', 'description', 'media', 'trailing']

registerBlockRenderer('item', ItemView)
