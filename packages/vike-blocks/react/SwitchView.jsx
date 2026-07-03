// The React renderer for the `switch` block — a dep-free, theme-native toggle with an animated
// sliding thumb. An accessible <button role="switch"> that toggles its own visual state (value
// binding is the actions axis #385). `checked` is the INITIAL state, so SSR and the first client
// render agree (no hydration mismatch). Track fill + thumb slide come from the shared switch-styles
// module, so this stays a thin binding and can't drift from the Vue twin.
import { useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import { switchRootStyle, switchTrackStyle, switchThumbStyle, SWITCH_STYLE_TAG } from '../blocks/switch-styles.js'

export function SwitchView({ label, checked = false, disabled = false, name }) {
  const [on, setOn] = useState(checked)
  return (
    <>
      <style>{SWITCH_STYLE_TAG}</style>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        name={name}
        disabled={disabled}
        className="vike-blocks-switch"
        data-slot="switch"
        onClick={() => setOn((v) => !v)}
        style={switchRootStyle(disabled)}
      >
        <span style={switchTrackStyle(on)}>
          <span style={switchThumbStyle(on)} />
        </span>
        {label != null && <span>{label}</span>}
      </button>
    </>
  )
}

registerBlockRenderer('switch', SwitchView)
