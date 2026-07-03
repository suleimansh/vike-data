// The Vue renderer for the `progress` block — the Vue twin of react/ProgressView.jsx, a dep-free,
// theme-native progress bar. The determinate fill is a pure-CSS width; the indeterminate mode is a
// keyframed sliding segment (the shared PROGRESS_STYLE_TAG). No JS and no state, so SSR renders the
// final markup. An optional caption row shows the label + value%. Shares the styles with the React
// renderer via progress-styles.
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { progressLabelRowStyle, progressLabelStyle, progressValueStyle, progressTrackStyle, progressFillStyle, PROGRESS_STYLE_TAG } from '../progress-styles.js'

export const ProgressView = {
  props: ['value', 'max', 'percent', 'indeterminate', 'size', 'label'],
  setup(props) {
    return () => {
      const percent = props.percent ?? 0
      const max = props.max ?? 100
      const indeterminate = props.indeterminate ?? false
      const size = props.size ?? 8
      const children = [h('style', PROGRESS_STYLE_TAG)]
      if (props.label != null) {
        children.push(
          h('div', { style: progressLabelRowStyle() }, [
            h('span', { style: progressLabelStyle() }, props.label),
            indeterminate ? null : h('span', { style: progressValueStyle() }, `${Math.round(percent)}%`),
          ]),
        )
      }
      children.push(
        h(
          'div',
          {
            role: 'progressbar',
            'data-slot': 'progress',
            'aria-valuemin': 0,
            'aria-valuemax': indeterminate ? undefined : max,
            'aria-valuenow': indeterminate ? undefined : (props.value ?? Math.round(percent)),
            style: progressTrackStyle(size),
          },
          indeterminate
            ? [h('div', { class: 'vike-blocks-progress-indet', 'data-slot': 'progress-indicator' })]
            : [h('div', { 'data-slot': 'progress-indicator', style: progressFillStyle(percent) })],
        ),
      )
      return h('div', { 'data-slot': 'progress-block' }, children)
    }
  },
}

registerBlockRenderer('progress', ProgressView)
