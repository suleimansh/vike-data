// The Vue renderer for the `timeline` block — the Vue twin of react/TimelineView.jsx, a dep-free,
// theme-native vertical activity feed. A rail of tone-colored dots joined by connector lines (the last
// row's connector omitted), each row a title + optional time + a body that is either text or nested
// blocks (drawn with <Blocks>). No JS, no state. Shares the styles with the React renderer via
// timeline-styles.
import { h } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import {
  timelineStyle,
  timelineItemStyle,
  timelineRailStyle,
  timelineDotStyle,
  timelineConnectorStyle,
  timelineContentStyle,
  timelineHeaderStyle,
  timelineTitleStyle,
  timelineTimeStyle,
  timelineBodyStyle,
  timelineBlocksStyle,
} from '../blocks/timeline-styles.js'

export const TimelineView = {
  props: ['items'],
  setup(props) {
    return () => {
      const items = props.items ?? []
      const rows = items.map((it, i) => {
        const last = i === items.length - 1
        const rail = h('div', { style: timelineRailStyle() }, [
          h('span', { 'data-slot': 'timeline-dot', style: timelineDotStyle(it.tone, it.filled) }),
          last ? null : h('span', { style: timelineConnectorStyle() }),
        ])
        const header = h('div', { style: timelineHeaderStyle() }, [
          h('span', { style: timelineTitleStyle() }, it.title),
          it.time != null ? h('span', { style: timelineTimeStyle() }, it.time) : null,
        ])
        const body =
          it.body == null
            ? null
            : it.blocks
              ? h('div', { style: timelineBlocksStyle() }, h(Blocks, { sections: it.body }))
              : h('div', { style: timelineBodyStyle() }, it.body)
        const content = h('div', { style: timelineContentStyle() }, [header, body])
        return h('li', { key: i, 'data-slot': 'timeline-item', style: timelineItemStyle() }, [rail, content])
      })
      return h('ul', { 'data-slot': 'timeline', style: timelineStyle() }, rows)
    }
  },
}

registerBlockRenderer('timeline', TimelineView)
