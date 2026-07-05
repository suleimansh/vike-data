// The `select` block — a single-choice form control over a native <select> (harvest: shadcn Base
// native-select), styled theme-native. Built with a fluent accumulating builder (like radio):
// `.option(value, label, { disabled })` appends a choice, `.value()` the INITIAL selection,
// `.placeholder()` a leading empty choice shown when nothing is picked, `.name()` the form name,
// `.disabled()` disables the control. The renderer tracks the selected value as local UI state
// (like radio/tabs); value BINDING + submit is the data/actions axis (#385). For a searchable list
// use the `combobox` block instead.
//
//   select()
//     .placeholder('Pick a plan')
//     .option('free', 'Free')
//     .option('pro', 'Pro')
//     .value('pro')
import { registerBlock } from '../core/registry.js'
import { normalizeOption, resolveOptions } from './_shared.js'

// A fluent builder for a select. `.option()` appends a choice (label defaults to the value).
export function select() {
  const options = []
  let selected
  let name
  let placeholder
  let disabled = false
  let required = false
  const self = {
    option(value, label, opts = {}) {
      options.push(normalizeOption({ value, label, disabled: opts.disabled }, { withDisabled: true }))
      return self
    },
    value(v) {
      selected = v
      return self
    },
    placeholder(text) {
      placeholder = text
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
    required() {
      required = true
      return self
    },
    build() {
      return {
        block: 'select',
        options: options.map((o) => ({ ...o })),
        ...(selected !== undefined ? { value: selected } : {}),
        ...(placeholder !== undefined ? { placeholder } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(disabled ? { disabled: true } : {}),
        ...(required ? { required: true } : {}),
      }
    },
  }
  return self
}

// Resolve the options + the initial selection. Unlike radio, a select does NOT force the first
// option: with a `placeholder` and no `value` the control shows the empty leading choice. When
// `required`, that placeholder choice is a disabled prompt (a real option must be picked); when not
// required, it stays selectable so the field can be cleared. The renderer owns the live state;
// `value` is only the INITIAL selection.
registerBlock('select', {
  category: 'form',
  summary: 'A single-choice dropdown over a list of options (native <select>).',
  example: "select().option('free', 'Free').option('pro', 'Pro').value('pro')",
  resolve({ props }) {
    const options = resolveOptions(props.options, { withDisabled: true })
    return {
      options,
      value: props.value ?? null,
      placeholder: props.placeholder ?? null,
      name: props.name ?? null,
      disabled: props.disabled ?? false,
      required: props.required ?? false,
    }
  },
})
