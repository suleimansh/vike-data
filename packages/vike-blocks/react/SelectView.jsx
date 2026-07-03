// The React renderer for the `select` block — a dep-free, theme-native single-choice control over a
// native <select> with the browser chevron replaced by ours. Tracks the selected value as local state
// (value binding is the actions axis #385); `value` is the INITIAL selection, so SSR and the first
// client render agree (no hydration mismatch). A `placeholder` renders a disabled empty leading option
// that shows until a real choice is picked. The box / chevron / focus ring come from the shared
// select-styles module, so this can't drift from the Vue twin.
import { useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import { selectWrapStyle, selectStyle, selectChevronStyle, CHEVRON_DOWN_PATH, SELECT_STYLE_TAG } from '../select-styles.js'

export function SelectView({ options = [], value = null, placeholder = null, name, disabled = false }) {
  const [selected, setSelected] = useState(value ?? '')
  const onPlaceholder = placeholder != null && (selected === '' || selected == null)
  return (
    <>
      <style>{SELECT_STYLE_TAG}</style>
      <span style={selectWrapStyle()}>
        <select
          className="vike-blocks-select"
          data-slot="select"
          data-placeholder={onPlaceholder ? 'true' : undefined}
          name={name}
          disabled={disabled}
          value={selected ?? ''}
          onChange={(e) => setSelected(e.target.value)}
          style={selectStyle(disabled)}
        >
          {placeholder != null && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span aria-hidden="true" style={selectChevronStyle()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={CHEVRON_DOWN_PATH} />
          </svg>
        </span>
      </span>
    </>
  )
}

registerBlockRenderer('select', SelectView)
