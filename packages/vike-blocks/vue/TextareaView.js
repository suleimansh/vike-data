// The Vue renderer for the `textarea` block — the Vue twin of react/TextareaView.jsx, a from-scratch,
// theme-native multi-line text input. A functional component (no state); display-only, so `value` is
// the initial value (uncontrolled) and binding is the actions axis (#385). Shares the base style +
// focus/placeholder/disabled states with the React renderer via textarea-styles, so they can't drift.
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { textareaStyle, TEXTAREA_STYLE_TAG } from '../textarea-styles.js'

export const TextareaView = (props) => {
  const { placeholder, value, rows = 3, name, disabled = false, required = false } = props
  return [
    h('style', TEXTAREA_STYLE_TAG),
    h('textarea', {
      class: 'vike-blocks-textarea',
      'data-slot': 'textarea',
      name,
      placeholder,
      rows,
      value,
      disabled: disabled || undefined,
      required: required || undefined,
      style: textareaStyle(disabled),
    }),
  ]
}
TextareaView.props = ['placeholder', 'value', 'rows', 'name', 'disabled', 'required']

registerBlockRenderer('textarea', TextareaView)
