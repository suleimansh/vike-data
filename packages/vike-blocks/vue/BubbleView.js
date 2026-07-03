// The Vue renderer for the `bubble` block — the Vue twin of react/BubbleView.jsx, a static,
// theme-native chat message bubble aligned to its sender. A plain-string body renders as text; a rich
// body is a resolved nested block composition drawn with <Blocks>. Alignment + colors are shared with
// the React renderer via bubble-styles, so they can't drift.
import { h } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import { bubbleRowStyle, bubbleStyle } from '../blocks/bubble-styles.js'

export const BubbleView = (props) => {
  const from = props.from ?? 'assistant'
  const body = props.sections ? h(Blocks, { sections: props.sections }) : props.text
  return h('div', { 'data-slot': 'bubble-row', style: bubbleRowStyle(from) }, [
    h('div', { 'data-slot': 'bubble', 'data-from': from, style: bubbleStyle(from) }, body),
  ])
}
BubbleView.props = ['from', 'text', 'sections']

registerBlockRenderer('bubble', BubbleView)
