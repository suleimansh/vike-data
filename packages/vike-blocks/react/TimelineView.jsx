// The React renderer for the `timeline` block — a dep-free, theme-native vertical activity feed. A
// rail of tone-colored dots joined by connector lines (the last row's connector omitted), each row a
// title + optional time + a body that is either text or nested blocks (drawn with <Blocks>). No JS,
// no state; SSR renders the final markup. Styles come from the shared timeline-styles module, so this
// can't drift from the Vue twin.
import { Blocks } from './Blocks.jsx'
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

export function TimelineView({ items = [] }) {
  return (
    <ul data-slot="timeline" style={timelineStyle()}>
      {items.map((it, i) => {
        const last = i === items.length - 1
        return (
          <li key={i} data-slot="timeline-item" style={timelineItemStyle()}>
            <div style={timelineRailStyle()}>
              <span data-slot="timeline-dot" style={timelineDotStyle(it.tone, it.filled)} />
              {!last && <span style={timelineConnectorStyle()} />}
            </div>
            <div style={timelineContentStyle()}>
              <div style={timelineHeaderStyle()}>
                <span style={timelineTitleStyle()}>{it.title}</span>
                {it.time != null && <span style={timelineTimeStyle()}>{it.time}</span>}
              </div>
              {it.body != null &&
                (it.blocks ? (
                  <div style={timelineBlocksStyle()}>
                    <Blocks sections={it.body} />
                  </div>
                ) : (
                  <div style={timelineBodyStyle()}>{it.body}</div>
                ))}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

registerBlockRenderer('timeline', TimelineView)
