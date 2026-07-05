// The `slider` block — a range form control (a draggable thumb over a filled track) defined through
// the defineBlock seam. `slider(label)` sets an optional inline label; `.min()`, `.max()`, `.step()`
// bound the range (defaults 0 / 100 / 1), `.value()` is the INITIAL position, `.disabled()` disables
// it, `.name()` sets the form name. The renderer tracks its own visual position (local UI state, like
// switch/checkbox); value BINDING + submit is the data/actions axis (#385).
//
//   slider().min(0).max(100).step(1).value(40)
//   slider('Volume').value(70)
//   slider('Locked').value(30).disabled()
import { defineBlock } from '../core/registry.js'

export const slider = defineBlock('slider', {
  category: 'form',
  summary: "A range slider.",
  example: "slider('Volume').min(0).max(100).value(40)",
  build: (label) => (label !== undefined ? { label } : {}),
  refine: {
    min: (n) => ({ min: n }),
    max: (n) => ({ max: n }),
    step: (n) => ({ step: n }),
    value: (v) => ({ value: v }),
    disabled: () => ({ disabled: true }),
    name: (n) => ({ name: n }),
  },
})
