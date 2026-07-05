// The Vue renderer for the `description-list` block — the Vue twin of react/DescriptionListView.jsx. A
// key-value metadata grid over the shared style module. Static (no state), so it renders fully on the
// server. Semantic <dl> markup: each cell groups a <dt> (term) + <dd> (value); a value is a plain string
// or nested blocks (drawn with <Blocks>).
import { h } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import { dlRootStyle, dlTitleStyle, dlGridStyle, dlItemStyle, dlTermStyle, dlValueStyle, DL_STYLE_TAG } from '../blocks/description-list-styles.js'

export const DescriptionListView = {
  props: ['items', 'columns', 'bordered', 'title'],
  setup(props) {
    return () => {
      const items = props.items ?? []
      const columns = props.columns ?? 2
      const bordered = props.bordered === true

      const cells = items.map((it, i) =>
        h('div', { key: i, style: dlItemStyle(it.span ?? 1, bordered) }, [
          h('dt', { style: dlTermStyle() }, it.term),
          h('dd', { style: dlValueStyle() }, it.blocks ? [h(Blocks, { sections: it.value })] : it.value),
        ]),
      )

      return h('div', { 'data-slot': 'description-list', style: dlRootStyle() }, [
        h('style', DL_STYLE_TAG),
        props.title ? h('div', { style: dlTitleStyle() }, props.title) : null,
        h('dl', { class: 'vike-blocks-dl', style: dlGridStyle(columns, bordered) }, cells),
      ])
    }
  },
}

registerBlockRenderer('description-list', DescriptionListView)
