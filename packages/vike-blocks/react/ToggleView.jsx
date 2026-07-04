// The React renderers for the `toggle-button` + `toggle-group` blocks — a dep-free, theme-native
// pressable button and segmented control. Each button is an accessible <button aria-pressed>; the
// pressed state is local UI state (value binding is the actions axis #385), initialised from the
// resolved `pressed` / `value`, so SSR and the first client render agree (no hydration mismatch). A
// group is a role="group" of connected buttons — single-select (one pressed, click again to clear) or
// `.multiple()` (each independent). Surface styles come from the shared toggle-styles module, so these
// can't drift from the Vue twins.
import { useState } from 'react'
import { registerBlockRenderer } from './registry.js'
import { toggleButtonStyle, toggleGroupStyle, groupPosition, TOGGLE_STYLE_TAG } from '../blocks/toggle-styles.js'

export function ToggleButtonView({ label = null, pressed = false, disabled = false }) {
  const [on, setOn] = useState(pressed)
  return (
    <>
      <style>{TOGGLE_STYLE_TAG}</style>
      <button
        type="button"
        className="vike-blocks-toggle"
        data-slot="toggle"
        aria-pressed={on}
        disabled={disabled}
        onClick={() => setOn((v) => !v)}
        style={toggleButtonStyle(on, disabled)}
      >
        {label}
      </button>
    </>
  )
}

export function ToggleGroupView({ items = [], value = [], multiple = false, disabled = false }) {
  const [selected, setSelected] = useState(value)
  const isOn = (v) => selected.includes(v)
  const toggle = (v) => {
    setSelected((cur) => {
      if (multiple) return cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
      return cur.includes(v) ? [] : [v] // single-select: click the pressed one to clear
    })
  }
  return (
    <>
      <style>{TOGGLE_STYLE_TAG}</style>
      <div role="group" data-slot="toggle-group" style={toggleGroupStyle()}>
        {items.map((it, i) => {
          const on = isOn(it.value)
          return (
            <button
              key={it.value}
              type="button"
              className="vike-blocks-toggle"
              data-slot="toggle"
              aria-pressed={on}
              disabled={disabled}
              onClick={() => toggle(it.value)}
              style={toggleButtonStyle(on, disabled, { grouped: true, position: groupPosition(i, items.length) })}
            >
              {it.label}
            </button>
          )
        })}
      </div>
    </>
  )
}

registerBlockRenderer('toggle-button', ToggleButtonView)
registerBlockRenderer('toggle-group', ToggleGroupView)
