// The `checkbox` block — a boolean form control leaf with an animated check, defined through the
// defineBlock seam. `checkbox(label)` sets the inline label; `.checked()` is the INITIAL checked
// state, `.disabled()` disables it, `.name()` sets the form name. The renderer toggles its own visual
// state (local UI state, like tabs/accordion); value BINDING + submit is the data/actions axis (#385).
//
//   checkbox('Accept the terms').checked()
//   checkbox('Subscribe to the newsletter')
//   checkbox('Locked').checked().disabled()
import { defineBlock } from './registry.js'

export const checkbox = defineBlock('checkbox', {
  build: (label) => (label !== undefined ? { label } : {}),
  refine: {
    checked: () => ({ checked: true }),
    disabled: () => ({ disabled: true }),
    name: (n) => ({ name: n }),
  },
})
