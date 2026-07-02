// The `input` block — a single-line text input leaf, defined through the defineBlock seam. A form
// primitive that pairs with `field` (#426) for its label/description/error shell. Display + declared
// attributes only: value BINDING and submit are the data/actions axis (#385, can't be an inline
// closure in serializable config), so `.value()` sets the initial value and the renderer draws an
// uncontrolled input.
//
//   input().type('email').placeholder('you@example.com')
//   input().value('draft').disabled()
//   input().type('password').name('password').required()
import { defineBlock } from './registry.js'

export const input = defineBlock('input', {
  build: () => ({ type: 'text' }),
  refine: {
    type: (t) => ({ type: t }),
    placeholder: (p) => ({ placeholder: p }),
    value: (v) => ({ value: v }),
    name: (n) => ({ name: n }),
    disabled: () => ({ disabled: true }),
    required: () => ({ required: true }),
  },
})
