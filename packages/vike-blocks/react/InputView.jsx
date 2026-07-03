// The React renderer for the `input` block — a from-scratch, theme-native single-line text input.
// Display-only: `value` is the INITIAL value (uncontrolled `defaultValue`); binding is the actions
// axis (#385). The base style + focus ring / placeholder / disabled states come from the shared
// input-styles module, so this stays a thin binding and can't drift from the Vue twin.
import { registerBlockRenderer } from './registry.js'
import { inputStyle, INPUT_STYLE_TAG } from '../blocks/input-styles.js'

export function InputView({ type = 'text', placeholder, value, name, disabled = false, required = false }) {
  return (
    <>
      <style>{INPUT_STYLE_TAG}</style>
      <input
        className="vike-blocks-input"
        data-slot="input"
        type={type}
        name={name}
        placeholder={placeholder}
        defaultValue={value}
        disabled={disabled}
        required={required || undefined}
        style={inputStyle(disabled)}
      />
    </>
  )
}

registerBlockRenderer('input', InputView)
