// The `rating` block — a star-rating form control, defined through the defineBlock seam. Hover to
// preview, click to set, arrow keys to adjust; optional half-stars and a read-only display mode (a
// product average). `rating(label)` sets an optional inline label; `.value(v)` is the INITIAL rating
// (the renderer tracks its own value as local UI state, like slider/switch — binding + submit is the
// actions axis #385); `.max(n)` the number of stars (default 5); `.allowHalf()` enables half-star
// precision; `.readOnly()` renders a non-interactive display; `.disabled()` disables it; `.name()` sets
// the form field name (a hidden input carries the value for a native submit).
//
//   rating('Rate your order').value(4).name('score')
//   rating().value(3.5).allowHalf()
//   rating('Average').value(4.5).max(5).allowHalf().readOnly()
import { defineBlock } from '../core/registry.js'

export const rating = defineBlock('rating', {
  build: (label) => (label !== undefined ? { label } : {}),
  refine: {
    value: (v) => ({ value: v }),
    max: (n) => ({ max: n }),
    allowHalf: () => ({ allowHalf: true }),
    readOnly: () => ({ readOnly: true }),
    disabled: () => ({ disabled: true }),
    name: (n) => ({ name: n }),
  },
})
