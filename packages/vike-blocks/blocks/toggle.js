// The `toggle-button` + `toggle-group` blocks — a pressable on/off button and a segmented control, the
// shadcn Toggle / ToggleGroup staple for toolbars (bold / italic) and segmented selects (list / grid,
// day / week / month). Distinct from `switch` (a form boolean with a sliding thumb): a toggle reads as
// a pressed button. The builder is `toggleButton` / `toggleGroup` because `toggle` is the switch's
// builder. Interactive: the pressed state is local UI state in the renderer (value binding is #385).
//
//   toggleButton('Bold').pressed()                         // a single pressable button
//   toggleGroup().item('list', 'List').item('grid', 'Grid').value('list')   // single-select segmented
//   toggleGroup().item('b', 'B').item('i', 'I').multiple().value(['b'])      // multi-select (toolbar)
import { registerBlock } from '../core/registry.js'
import { normalizeOption, resolveOptions } from './_shared.js'

// A single pressable toggle button. `.pressed()` sets the INITIAL pressed state, `.value()` an optional
// bound value, `.disabled()` disables it.
export function toggleButton(label) {
  let pressed = false
  let value
  let disabled = false
  const self = {
    pressed(on = true) {
      pressed = on !== false
      return self
    },
    value(v) {
      value = v
      return self
    },
    disabled() {
      disabled = true
      return self
    },
    build() {
      return {
        block: 'toggle-button',
        ...(label !== undefined ? { label } : {}),
        ...(pressed ? { pressed: true } : {}),
        ...(value !== undefined ? { value } : {}),
        ...(disabled ? { disabled: true } : {}),
      }
    },
  }
  return self
}

// A segmented control: `.item(value, label)` appends a choice, `.value()` the INITIAL selection (a
// string for single-select, or an array when `.multiple()`), `.multiple()` allows several pressed at
// once, `.disabled()` disables the group.
export function toggleGroup() {
  const items = []
  let selected
  let multiple = false
  let disabled = false
  const self = {
    item(value, label) {
      items.push(normalizeOption({ value, label }))
      return self
    },
    value(v) {
      selected = v
      return self
    },
    multiple() {
      multiple = true
      return self
    },
    disabled() {
      disabled = true
      return self
    },
    build() {
      return {
        block: 'toggle-group',
        items: items.map((o) => ({ ...o })),
        ...(selected !== undefined ? { value: selected } : {}),
        ...(multiple ? { multiple: true } : {}),
        ...(disabled ? { disabled: true } : {}),
      }
    },
  }
  return self
}

registerBlock('toggle-button', {
  resolve({ props }) {
    return {
      label: props.label ?? null,
      pressed: props.pressed ?? false,
      value: props.value ?? null,
      disabled: props.disabled ?? false,
    }
  },
})

// Resolve the items + the initial selection, normalized to an array of pressed values so the renderer
// treats single/multiple uniformly (single = the array holds 0 or 1). A bare declared string becomes a
// one-element array; an array stays (single-select keeps only its first). The renderer owns live state.
registerBlock('toggle-group', {
  resolve({ props }) {
    const items = resolveOptions(props.items)
    const multiple = props.multiple ?? false
    const declared = props.value
    let value = []
    if (Array.isArray(declared)) value = multiple ? declared.slice() : declared.slice(0, 1)
    else if (declared != null) value = [declared]
    return {
      items,
      multiple,
      value,
      disabled: props.disabled ?? false,
    }
  },
})
