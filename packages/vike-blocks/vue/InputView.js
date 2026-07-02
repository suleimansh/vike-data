// The Vue renderer for the `input` block — the Vue twin of react/InputView.jsx, a from-scratch,
// theme-native single-line text input. A functional component (no state); display-only, so `value`
// is the initial value (uncontrolled) and binding is the actions axis (#385). Shares the base style
// + focus/placeholder/disabled states with the React renderer via input-styles, so they can't drift.
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { inputStyle, INPUT_STYLE_TAG } from '../input-styles.js'

export const InputView = (props) => {
  const { type = 'text', placeholder, value, name, disabled = false, required = false } = props
  return [
    h('style', INPUT_STYLE_TAG),
    h('input', {
      class: 'vike-blocks-input',
      'data-slot': 'input',
      type,
      name,
      placeholder,
      value,
      disabled: disabled || undefined,
      required: required || undefined,
      style: inputStyle(disabled),
    }),
  ]
}
InputView.props = ['type', 'placeholder', 'value', 'name', 'disabled', 'required']

registerBlockRenderer('input', InputView)
