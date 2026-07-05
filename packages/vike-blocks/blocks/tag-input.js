// The `tag-input` block — a tag / chip multi-select: a token field for selecting MANY values, filling
// the multi-value hole the single-select `combobox` leaves. Type + Enter (or comma) adds a chip,
// Backspace on an empty input removes the last, and a chip's x removes it; an optional `suggestions`
// pool drives an autocomplete dropdown. A form control: the selected values are local UI state and, with
// a `.name()`, ride hidden inputs for a native submit (value binding is the actions axis #385).
//
//   tagInput()
//     .value(['react', 'vue'])
//     .suggestions(['react', 'vue', 'svelte', 'angular', 'solid'])
//     .placeholder('Add a framework...')
//     .name('frameworks')
import { registerBlock } from '../core/registry.js'

// A fluent builder for a tag input. `.value()` seeds the initial tags, `.suggestions()` the optional
// autocomplete pool, `.max()` caps the number of tags, `.name()` sets the form field name.
export function tagInput() {
  let value = []
  let suggestions
  let placeholder
  let name
  let max
  let disabled = false
  const self = {
    value(v = []) {
      value = Array.isArray(v) ? v.slice() : []
      return self
    },
    suggestions(list = []) {
      suggestions = Array.isArray(list) ? list.slice() : []
      return self
    },
    placeholder(p) {
      placeholder = p
      return self
    },
    name(n) {
      name = n
      return self
    },
    max(n) {
      max = n
      return self
    },
    disabled() {
      disabled = true
      return self
    },
    build() {
      return {
        block: 'tag-input',
        value: value.slice(),
        ...(suggestions !== undefined ? { suggestions: suggestions.slice() } : {}),
        ...(placeholder !== undefined ? { placeholder } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(max !== undefined ? { max } : {}),
        ...(disabled ? { disabled: true } : {}),
      }
    },
  }
  return self
}

// Resolve the initial tags + suggestions (coerced to strings) + the placeholder / name / max. The
// renderer owns the live tag list + query; `value` is only the INITIAL selection.
registerBlock('tag-input', {
  category: 'form',
  summary: "A multi-value tag input with suggestions.",
  example: "tagInput().value(['react']).suggestions(['react', 'vue', 'svelte']).name('frameworks')",
  resolve({ props }) {
    const max = typeof props.max === 'number' && props.max > 0 ? props.max : null
    return {
      value: Array.isArray(props.value) ? props.value.map(String) : [],
      suggestions: Array.isArray(props.suggestions) ? props.suggestions.map(String) : [],
      placeholder: props.placeholder ?? 'Add a tag...',
      name: props.name ?? null,
      max,
      disabled: props.disabled ?? false,
    }
  },
})
