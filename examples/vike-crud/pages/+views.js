// The app's views live in this `+views.js` file (its own +file), NOT inline in +config.js. Vike
// requires it: a view carries a `scope` FUNCTION, and Vike refuses to serialize a function into
// the page config (https://vike.dev/error/runtime-in-config) -- a `+views.js` file is
// pointer-imported and loaded on the server instead, so the function survives to the data hook.
// This is the `views` cumulative config point; +config.js imports the same array to build
// `pages: viewPages(views)` (routes are plain strings, safe to compute inline).
//
// A `definePage` is a page composed of blocks; `crudBlocks({ table })` expands a table into its
// list + record + form blocks, derived from the schema. `scope` is the owner contract (#104): it
// receives (table, ctx) at request time and returns a universal-orm filter that bounds every read
// AND is forced onto writes, so a user only ever sees and creates their OWN rows. `ctx.user` comes
// from +onCreatePageContext.js (a fixed demo identity here; a real app gets it from vike-auth).
// Vike reads a +file's DEFAULT export as the config value (and rejects any OTHER export from a
// +file), so the views are the sole default export. +config.js imports this default to compute
// `pages: viewPages(views)`.
import { definePage, crudBlocks, column, field } from 'vike-crud/react/pages'

export default [
  definePage({
    route: '/posts',
    sections: crudBlocks({
      table: 'posts',
      list: [column('title').sortable().searchable(), column('status'), column('published'), column('created_at').label('Created').format('since')],
      form: [field('title').required(), field('body'), field('status'), field('published')],
    }),
    scope: (table, ctx) => ({ user_id: ctx.user.id }),
  }),
]
