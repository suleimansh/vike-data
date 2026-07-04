// The Vue renderer for the `empty-state` block — the Vue twin of react/EmptyStateView.jsx. A static,
// functional component (no state — an empty state doesn't animate): a centered column with an
// illustration medallion, a title, a muted description, and an optional action row. A custom `icon`
// block renders through <Blocks>; with none, a built-in inbox icon is drawn. Shares all styling with
// the React renderer via empty-state-styles, so it can't drift.
import { h } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import {
  EMPTY_STATE_ICON_PATH,
  emptyStateStyle,
  emptyStateMedallionStyle,
  emptyStateTitleStyle,
  emptyStateDescriptionStyle,
  emptyStateActionsStyle,
} from '../blocks/empty-state-styles.js'

export const EmptyStateView = {
  props: ['title', 'description', 'icon', 'actions'],
  setup(props) {
    return () => {
      const title = props.title ?? ''
      const description = props.description ?? null
      const icon = props.icon ?? null
      const actions = props.actions ?? []

      const medallion = h('div', { style: emptyStateMedallionStyle() }, [
        icon
          ? h(Blocks, { sections: [icon] })
          : h(
              'svg',
              { viewBox: '0 0 24 24', width: '26', height: '26', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
              [h('path', { d: EMPTY_STATE_ICON_PATH })],
            ),
      ])

      const children = [medallion]
      if (title) children.push(h('p', { style: emptyStateTitleStyle() }, title))
      if (description != null) children.push(h('p', { style: emptyStateDescriptionStyle() }, description))
      if (actions.length > 0) children.push(h('div', { style: emptyStateActionsStyle() }, [h(Blocks, { sections: actions })]))

      return h('div', { 'data-slot': 'empty-state', style: emptyStateStyle() }, children)
    }
  },
}

registerBlockRenderer('empty-state', EmptyStateView)
