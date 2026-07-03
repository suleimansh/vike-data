// The Vue renderer for the `alert` block — the Vue twin of react/AlertView.jsx, the shadcn Radix
// alert surface: a bordered box with a bare accent icon, a medium-weight title, and a muted
// description. Theme-native; the per-intent style comes from the shared alert-styles module, so the
// two renderers can't drift. A functional component (no state).
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { alertStyles, intentKey } from '../blocks/alert-styles.js'

export const AlertView = (props) => {
  const s = alertStyles(props.intent)
  const icon = h('span', { 'aria-hidden': 'true', style: s.iconStyle }, s.icon)
  const content = h('div', [
    props.title ? h('strong', { style: s.titleStyle }, props.title) : null,
    props.body ? h('p', { style: s.bodyStyle(!!props.title) }, props.body) : null,
  ])
  return h('div', { role: 'alert', 'data-slot': 'alert', 'data-intent': intentKey(props.intent), style: s.box }, [icon, content])
}
AlertView.props = ['title', 'intent', 'body']

registerBlockRenderer('alert', AlertView)
