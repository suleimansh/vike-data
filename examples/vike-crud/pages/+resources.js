// The app's resources live in this `+resources.js` file (its own +file), NOT inline in +config.js.
// Vike requires it: a resource carries auth FUNCTIONS (`query` / `onCreate`), and Vike refuses to
// serialize a function into the page config (https://vike.dev/error/runtime-in-config) -- a
// `+resources.js` file is pointer-imported and loaded on the server instead, so the functions
// survive to the data hook. This is the `resources` cumulative config point; +config.js imports the
// same array to build `pages: viewPages(resources)` (routes are plain strings, safe to compute inline).
//
// `defineResource({ table, ... })` declares a table as a CRUD resource; `resourcePages(resource)`
// mounts it as the pages it needs (index / view / create / edit), choosing how each screen is
// presented. The schema is the intent; the pages are derived. `resourcePages` is a pure expander --
// it returns the explicit `definePage[]` you would otherwise hand-write, and `ejectCrud` reveals it.
//
// Owner scoping (#104): `query` bounds every read to the current user's rows and `onCreate` stamps
// the owner onto every insert, so a user only ever sees and creates their OWN posts. `ctx.user` comes
// from +onCreatePageContext.js (a fixed demo identity here; a real app gets it from vike-auth).
import { defineResource, resourcePages, column, display, field } from 'vike-crud/react/pages'

const owner = {
  query: (q, ctx) => q.where('user_id', ctx.user.id),
  onCreate: (ctx) => ({ user_id: ctx.user.id }),
}

export default [
  // `/posts` -- `mode: 'dialog'`. One list page at /posts; view / create / edit open as dialogs over
  // it (`?view=<id>`, `?create`, `?edit=<id>`). The list is the whole page until a dialog is
  // triggered, so nothing empty stacks on the index -- the empty `<dl>` this epic set out to kill.
  ...resourcePages(
    defineResource({
      table: 'posts',
      mode: 'dialog',
      index: [column('title').sortable().searchable(), column('status'), column('published'), column('created_at').label('Created').format('since')],
      view: [display('title'), display('body'), display('status'), display('published')],
      edit: [field('title').required(), field('body'), field('status'), field('published')],
      ...owner,
    }),
  ),
  // `/posts-route` -- the same resource in `mode: 'route'` (the default): separate pages at
  // /posts-route, /posts-route/@id (view), /posts-route/new (create), /posts-route/@id/edit. The list
  // links each row to its own detail page instead of a dialog. `inline` is the third mode (screens
  // stacked in place).
  ...resourcePages(
    defineResource({
      table: 'posts',
      route: '/posts-route',
      mode: 'route',
      index: [column('title').sortable(), column('status')],
      view: [display('title'), display('body'), display('status')],
      edit: [field('title').required(), field('body'), field('status')],
      ...owner,
    }),
  ),
]
