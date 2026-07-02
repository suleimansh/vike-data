// The `switch` block — a boolean toggle form control with an animated sliding thumb, defined through
// the defineBlock seam. The builder is exported as `toggle` (`switch` is a reserved word); the block
// TYPE is 'switch'. `toggle(label)` sets the inline label; `.checked()` is the INITIAL on-state,
// `.disabled()` disables it, `.name()` sets the form name. The renderer toggles its own visual state
// (local UI state, like checkbox/radio); value BINDING + submit is the data/actions axis (#385).
//
//   toggle('Dark mode').checked()
//   toggle('Email notifications')
//   toggle('Locked').checked().disabled()
import { defineBlock } from './registry.js'

export const toggle = defineBlock('switch', {
  build: (label) => (label !== undefined ? { label } : {}),
  refine: {
    checked: () => ({ checked: true }),
    disabled: () => ({ disabled: true }),
    name: (n) => ({ name: n }),
  },
})
