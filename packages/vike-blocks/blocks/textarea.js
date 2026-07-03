// The `textarea` block — a multi-line text input leaf, sibling of `input` (#427) and a form primitive
// that pairs with `field` (#426). Display + declared attributes only: value BINDING and submit are the
// data/actions axis (#385), so `.value()` sets the initial value and the renderer draws an
// uncontrolled textarea.
//
//   textarea().placeholder('Write a bio...').rows(5)
//   textarea().value('Draft note').disabled()
import { defineBlock } from '../core/registry.js'

export const textarea = defineBlock('textarea', {
  build: () => ({}),
  refine: {
    placeholder: (p) => ({ placeholder: p }),
    value: (v) => ({ value: v }),
    rows: (n) => ({ rows: n }),
    name: (n) => ({ name: n }),
    disabled: () => ({ disabled: true }),
    required: () => ({ required: true }),
  },
})
