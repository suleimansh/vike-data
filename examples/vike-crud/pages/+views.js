// The app's views live in this `+views.js` file (its own +file), NOT inline in +config.js. Vike
// requires it: a view carries a `scope` FUNCTION, and Vike refuses to serialize a function into
// the page config (https://vike.dev/error/runtime-in-config) -- a `+views.js` file is
// pointer-imported and loaded on the server instead, so the function survives to the data hook.
// This is the `views` cumulative config point; +config.js imports the same array to build
// `pages: viewPages(views)` (routes are plain strings, safe to compute inline).
//
// A `definePage` is a page composed of blocks; `crudBlocks({ table })` expands a table into its
// list + record + form block DESCRIPTORS (an array: [list, record, form]). Because those are plain,
// composable descriptors, this page ARRANGES them by hand instead of dropping the triad in as-is: a
// page heading + intro, then the owner-scoped list, then a "New post" heading over the create form.
// The `record` block is left out -- an empty record reads as clutter on a list route; it belongs on
// a detail route (see /posts-ejected for a hand-written page). This is the point of blocks-as-data:
// the generated pieces are rearrangeable, not a fixed layout.
//
// The form stays a TOP-LEVEL section (not nested in a card): the POST handler finds the form's fields
// by scanning the view's top-level sections (formFieldsFor), and it must stay a real, top-level
// <form> for the native, no-JS submit to round-trip.
//
// `scope` is the owner contract (#104): it receives (table, ctx) at request time and returns a
// universal-orm filter that bounds every read AND is forced onto writes, so a user only ever sees
// and creates their OWN rows. `ctx.user` comes from +onCreatePageContext.js (a fixed demo identity
// here; a real app gets it from vike-auth). Vike reads a +file's DEFAULT export as the config value.
import { definePage, crudBlocks, column, field } from 'vike-crud/react/pages'
import { heading, text } from 'vike-blocks'

// The generated CRUD triad for `posts`, derived from the schema. We destructure it and use the list
// + form (skipping the record view, which has nothing to show on a list route).
const [list, , form] = crudBlocks({
  table: 'posts',
  list: [column('title').sortable().searchable(), column('status'), column('published'), column('created_at').label('Created').format('since')],
  form: [field('title').required(), field('body'), field('status'), field('published')],
})

export default [
  definePage({
    route: '/posts',
    sections: [
      heading('Posts').level(1),
      text('One defineSchema drives this whole page. The list and the create form below are both derived from the posts schema; every row is owner-scoped to you.').tone('muted'),
      list,
      heading('New post').level(2),
      text('Fields come straight from the schema -- a required title, an optional body, a status select, and a published toggle.').tone('muted'),
      form,
    ],
    scope: (table, ctx) => ({ user_id: ctx.user.id }),
  }),
]
