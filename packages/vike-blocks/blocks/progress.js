// The `progress` block — a determinate (or indeterminate) progress bar, harvested from shadcn's Radix
// progress and reimplemented dep-free (pure-CSS fill + a keyframed indeterminate segment; no JS/state).
// `progress(value)` fills to `value` of `max` (default 100); `.indeterminate()` animates an unknown-
// duration bar; `.label()` adds a caption row (label + value%); `.size(px)` sets the bar height.
//
//   progress(66)                                  // 66%
//   progress().value(3).max(5).label('Step 3 of 5')
//   progress().indeterminate().label('Loading...')
import { registerBlock } from '../core/registry.js'
import { clampPercent } from './progress-styles.js'

// A fluent builder for a progress bar.
export function progress(value) {
  let max = 100
  let indeterminate = false
  let size = 8
  let label
  const self = {
    value(v) {
      value = v
      return self
    },
    max(m) {
      max = m
      return self
    },
    indeterminate() {
      indeterminate = true
      return self
    },
    size(px) {
      size = px
      return self
    },
    label(text) {
      label = text
      return self
    },
    build() {
      return {
        block: 'progress',
        ...(value !== undefined ? { value } : {}),
        max,
        size,
        ...(indeterminate ? { indeterminate: true } : {}),
        ...(label !== undefined ? { label } : {}),
      }
    },
  }
  return self
}

// Resolve the value into a clamped percent (null when indeterminate). The renderer draws the track + the
// fill (or the animated segment) and the optional caption row.
registerBlock('progress', {
  resolve({ props }) {
    const max = props.max ?? 100
    const indeterminate = props.indeterminate ?? false
    return {
      value: props.value ?? null,
      max,
      percent: indeterminate ? null : clampPercent(props.value ?? 0, max),
      indeterminate,
      size: props.size ?? 8,
      label: props.label ?? null,
    }
  },
})
