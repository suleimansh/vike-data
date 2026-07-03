// The React renderer for the `textarea` block — a from-scratch, theme-native multi-line text input.
// Display-only: `value` is the INITIAL value (uncontrolled `defaultValue`); binding is the actions
// axis (#385). Base style + focus ring / placeholder / disabled states come from the shared
// textarea-styles module, so this stays a thin binding and can't drift from the Vue twin.
import { registerBlockRenderer } from './registry.js'
import { textareaStyle, TEXTAREA_STYLE_TAG } from '../blocks/textarea-styles.js'

export function TextareaView({ placeholder, value, rows = 3, name, disabled = false, required = false }) {
  return (
    <>
      <style>{TEXTAREA_STYLE_TAG}</style>
      <textarea
        className="vike-blocks-textarea"
        data-slot="textarea"
        name={name}
        placeholder={placeholder}
        defaultValue={value}
        rows={rows}
        disabled={disabled}
        required={required || undefined}
        style={textareaStyle(disabled)}
      />
    </>
  )
}

registerBlockRenderer('textarea', TextareaView)
