// The `button` block — a leaf catalog element, defined through the defineBlock seam. `.to(path)`
// renders an <a> styled as a button (declarative navigation); `.action(name)` references a named
// action (the actions axis, #385): the name + `.params()` stay serializable data (no inline
// closure), and vike-actions resolves the name to a handler at click time. Without a provider the
// action button is inert. The renderer draws the shadcn Base surface: `.variant()` picks the style
// (default / secondary / outline / ghost / link / destructive — our old primary/danger alias onto
// default/destructive), `.size()` the scale (sm / default / lg / icon; old md aliases default),
// `.disabled()` the disabled state.
//
//   button('Save').variant('default')
//   button('Delete').variant('destructive').disabled()
//   button('Cancel').variant('ghost').to('/back').size('sm')
//   button('Publish').action('publish').params({ id: '$row.id' })
import { defineBlock } from './registry.js'

export const button = defineBlock('button', {
  build: (label) => ({ label }),
  refine: {
    variant: (v) => ({ variant: v }),
    to: (path) => ({ to: path }),
    size: (s) => ({ size: s }),
    disabled: () => ({ disabled: true }),
    action: (name) => ({ action: name }),
    params: (params) => ({ params }),
  },
})
