// The `radio` block — a radio GROUP: pick one of several options. A form control with an animated
// selection, built with a fluent accumulating builder (like tabs). `.option(value, label)` appends a
// choice; `.value()` sets the INITIAL selection, `.name()` the form name, `.disabled()` disables the
// group. The renderer tracks the selected value as local UI state (like tabs/checkbox); selection +
// submit is the data/actions axis (#385). The builder is named `radio` to match the block type.
//
//   radio()
//     .option('free', 'Free')
//     .option('pro', 'Pro')
//     .option('team', 'Team')
//     .value('pro')
import { registerBlock } from '../core/registry.js'
import { normalizeOption, resolveOptions } from './_shared.js'

// A fluent builder for a radio group. `.option()` appends a choice (label defaults to the value).
export function radio() {
  const options = []
  let selected
  let name
  let disabled = false
  const self = {
    option(value, label) {
      options.push(normalizeOption({ value, label }))
      return self
    },
    value(v) {
      selected = v
      return self
    },
    name(n) {
      name = n
      return self
    },
    disabled() {
      disabled = true
      return self
    },
    build() {
      return {
        block: 'radio',
        options: options.map((o) => ({ ...o })),
        ...(selected !== undefined ? { value: selected } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(disabled ? { disabled: true } : {}),
      }
    },
  }
  return self
}

// Resolve the options + the initial selection (declared `value`, else the first option). The renderer
// draws the radio group; `value` is only the INITIAL selection (the renderer owns the live state).
registerBlock('radio', {
  resolve({ props }) {
    const options = resolveOptions(props.options)
    return {
      options,
      value: props.value ?? options[0]?.value ?? null,
      name: props.name ?? null,
      disabled: props.disabled ?? false,
    }
  },
})
