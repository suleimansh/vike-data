// The React renderer for the `radio` block — a dep-free, theme-native radio group with an animated
// selection. Each option is an accessible <button role="radio"> in a role="radiogroup"; picking one
// updates the local selection (value binding is the actions axis #385). `value` is the INITIAL
// selection, so SSR and the first client render agree (no hydration mismatch). The circle / dot /
// focus ring come from the shared radio-styles module, so this can't drift from the Vue twin.
import { useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import { radioRootStyle, radioOptionStyle, radioCircleStyle, radioDotStyle, RADIO_STYLE_TAG } from '../blocks/radio-styles.js'

export function RadioGroupView({ options = [], value = null, name, disabled = false }) {
  const [selected, setSelected] = useState(value)
  return (
    <>
      <style>{RADIO_STYLE_TAG}</style>
      <div role="radiogroup" data-slot="radio-group" style={radioRootStyle()}>
        {options.map((opt) => {
          const on = opt.value === selected
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={on}
              name={name}
              disabled={disabled}
              className="vike-blocks-radio"
              data-slot="radio"
              onClick={() => setSelected(opt.value)}
              style={radioOptionStyle(disabled)}
            >
              <span style={radioCircleStyle(on)}>
                <span style={radioDotStyle(on)} />
              </span>
              {opt.label != null && <span>{opt.label}</span>}
            </button>
          )
        })}
      </div>
    </>
  )
}

registerBlockRenderer('radio', RadioGroupView)
