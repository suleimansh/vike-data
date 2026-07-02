// The React renderer for the `checkbox` block — a dep-free, theme-native boolean control with an
// animated check. An accessible <button role="checkbox"> that toggles its own visual state (local UI
// state; value binding is the actions axis #385). `checked` is the INITIAL state, so SSR and the
// first client render agree (no hydration mismatch). Box fill + check spring come from the shared
// checkbox-styles module, so this stays a thin binding and can't drift from the Vue twin.
import { useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import { checkboxRootStyle, checkboxBoxStyle, checkStyle, CHECKBOX_STYLE_TAG } from '../checkbox-styles.js'

function Check({ checked }) {
  return (
    <svg
      aria-hidden="true"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-primary-text, #ffffff)"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={checkStyle(checked)}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function CheckboxView({ label, checked = false, disabled = false, name }) {
  const [on, setOn] = useState(checked)
  return (
    <>
      <style>{CHECKBOX_STYLE_TAG}</style>
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        name={name}
        disabled={disabled}
        className="vike-blocks-checkbox"
        data-slot="checkbox"
        onClick={() => setOn((v) => !v)}
        style={checkboxRootStyle(disabled)}
      >
        <span style={checkboxBoxStyle(on)}>
          <Check checked={on} />
        </span>
        {label != null && <span>{label}</span>}
      </button>
    </>
  )
}

registerBlockRenderer('checkbox', CheckboxView)
