// The `combobox` block — a searchable single-choice control (harvest: shadcn combobox = popover + a
// search input + a listbox). Where `select` is a native dropdown, a combobox filters a long list as
// you type. Built with a fluent accumulating builder (like radio/dropdown): `.option(value, label)`
// appends a choice, `.value()` the INITIAL selection, `.placeholder()` the trigger text when nothing
// is picked, `.searchPlaceholder()` the filter input hint, `.empty()` the no-results text, `.name()`
// the form name (a hidden input carries the value), `.disabled()` disables it. The renderer reuses the
// popover primitive (anchor + outside-click + Escape) and owns the live open/query/selection state;
// value binding + submit is the data/actions axis (#385).
//
//   combobox()
//     .placeholder('Assign to...')
//     .searchPlaceholder('Search people')
//     .option('ada', 'Ada Lovelace')
//     .option('alan', 'Alan Turing')
import { registerBlock } from '../core/registry.js'
import { normalizeOption, resolveOptions } from './_shared.js'

// A fluent builder for a combobox. `.option()` appends a choice (label defaults to the value).
export function combobox() {
  const options = []
  let selected
  let name
  let placeholder
  let searchPlaceholder
  let empty
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
    placeholder(text) {
      placeholder = text
      return self
    },
    searchPlaceholder(text) {
      searchPlaceholder = text
      return self
    },
    empty(text) {
      empty = text
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
        block: 'combobox',
        options: options.map((o) => ({ ...o })),
        ...(selected !== undefined ? { value: selected } : {}),
        ...(placeholder !== undefined ? { placeholder } : {}),
        ...(searchPlaceholder !== undefined ? { searchPlaceholder } : {}),
        ...(empty !== undefined ? { empty } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(disabled ? { disabled: true } : {}),
      }
    },
  }
  return self
}

// Resolve the options + the initial selection + the (defaulted) text labels. The renderer owns the
// live open/query/selection state; this stays a pass-through of the declared list.
registerBlock('combobox', {
  category: 'form',
  summary: "A searchable single-choice dropdown.",
  example: "combobox().placeholder('Assign to...').option('ada', 'Ada Lovelace').option('alan', 'Alan Turing')",
  resolve({ props }) {
    const options = resolveOptions(props.options)
    return {
      options,
      value: props.value ?? null,
      placeholder: props.placeholder ?? 'Select...',
      searchPlaceholder: props.searchPlaceholder ?? 'Search...',
      empty: props.empty ?? 'No results.',
      name: props.name ?? null,
      disabled: props.disabled ?? false,
    }
  },
})
