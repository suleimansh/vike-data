// The `item` block — a list-row primitive: an optional leading media, a title, an optional
// description, and an optional trailing note, laid out in a row. A reusable building block for lists,
// menus, and settings rows, defined through the defineBlock seam. Display-only: `media` and
// `trailing` are short text/emoji strings (rich block slots are the actions/menu axis, #385).
//
//   item('Billing').description('Manage your plan and invoices').media('💳').trailing('Pro')
//   item('Sign out').media('↩')
import { defineBlock } from './registry.js'

export const item = defineBlock('item', {
  build: (title) => (title !== undefined ? { title } : {}),
  refine: {
    description: (d) => ({ description: d }),
    media: (m) => ({ media: m }),
    trailing: (t) => ({ trailing: t }),
  },
})
