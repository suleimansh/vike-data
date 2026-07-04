// The app's contribution to vike-admin's cumulative `adminResources` point. It lives in its
// own +<configName>.js file (not inline in +config.js) because a resource carries auth FUNCTIONS
// (query / onCreate / canX) that Vike can't serialize into the page config; a dedicated file is
// pointer-imported instead. Same seam as `schemas` / `themes`, just runtime values.
//
// A resource is the REFINEMENT on top of a composed-schema table. `posts` gets a curated
// list + form; `tags` is BARE — `defineResource({ table })` derives every column and field
// from the schema (id / timestamps auto-hidden). `users` (vike-auth's table) gets a tiny
// resource mainly so its `recordTitle` labels the posts.author_id picker by email.
//
// Authorization is the defineCrud model (#581): flat `canX(ctx)` / `canX(record, ctx)` gates
// (missing = allowed), the `query(q, ctx)` read scope, and the `onCreate(ctx)` write stamp. This
// demo has no row-owner scoping (an admin app sees every row), so it only gates on "signed in".
import { defineResource, column, field } from 'vike-admin/define'

// Every screen requires a signed-in user. canIndex/canCreate take `(ctx)`; canEdit/canDelete take
// `(record, ctx)` (the loaded row + ctx). Spread onto each resource below.
const signedIn = {
  canIndex: (ctx) => !!ctx.user,
  canCreate: (ctx) => !!ctx.user,
  canEdit: (record, ctx) => !!ctx.user,
  canDelete: (record, ctx) => !!ctx.user,
}

const postsResource = defineResource({
  table: 'posts',
  label: 'Posts',
  recordTitle: 'title',
  index: [
    column('title').sortable().searchable(),
    column('published'),
    column('author_id').label('Author'), // FK -> resolved to the user's email (users.recordTitle)
    column('created_at').label('Created').format('since'),
  ],
  edit: [
    field('title').required(),
    field('body'),
    field('published'),
    field('author_id'), // FK -> rendered as a user picker
    // id / created_at / updated_at auto-hidden by convention.
  ],
  ...signedIn,
})

// Bare: no list/form — every column + field is derived from the tags schema. `mode: 'dialog'` (#596)
// makes its view/create/edit open as an OVERLAY on the list (`/admin/tags?view=@id` / `?edit=@id` /
// `?create`) instead of navigating to a sub-page — the shareable, refresh-safe edit-in-dialog. React
// only; on Vue this resource falls back to route mode. Every other resource here stays route-mode.
const tagsResource = defineResource({ table: 'tags', label: 'Tags', mode: 'dialog', ...signedIn })

// A minimal resource over vike-auth's `users` table so the posts author FK renders as a
// picker labeled by email (recordTitle) instead of a raw uuid.
const usersResource = defineResource({
  table: 'users',
  label: 'Users',
  recordTitle: 'email',
  index: [column('email').searchable(), column('name'), column('created_at').format('since')],
  ...signedIn,
})

export default [postsResource, tagsResource, usersResource]
