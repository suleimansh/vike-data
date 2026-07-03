// The app's contribution to vike-admin's cumulative `adminResources` point. It lives in its
// own +<configName>.js file (not inline in +config.js) because a resource carries FUNCTIONS
// (canView / canEdit) that Vike can't serialize into the page config; a dedicated file is
// pointer-imported instead. Same seam as `schemas` / `themes`, just runtime values.
//
// A resource is the REFINEMENT on top of a composed-schema table. `posts` gets a curated
// list + form; `tags` is BARE — `defineResource({ table })` derives every column and field
// from the schema (id / timestamps auto-hidden). `users` (vike-auth's table) gets a tiny
// resource mainly so its `recordTitle` labels the posts.author_id picker by email.
import { defineResource, column, field } from 'vike-admin/define'

const postsResource = defineResource({
  table: 'posts',
  label: 'Posts',
  recordTitle: 'title',
  list: [
    column('title').sortable().searchable(),
    column('published'),
    column('author_id').label('Author'), // FK -> resolved to the user's email (users.recordTitle)
    column('created_at').label('Created').format('since'),
  ],
  form: [
    field('title').required(),
    field('body'),
    field('published'),
    field('author_id'), // FK -> rendered as a user picker
    // id / created_at / updated_at auto-hidden by convention.
  ],
  canView: (user) => !!user, // any signed-in user
  canEdit: (user) => !!user,
})

// Bare: no list/form — every column + field is derived from the tags schema.
const tagsResource = defineResource({ table: 'tags', label: 'Tags' })

// A minimal resource over vike-auth's `users` table so the posts author FK renders as a
// picker labeled by email (recordTitle) instead of a raw uuid.
const usersResource = defineResource({
  table: 'users',
  label: 'Users',
  recordTitle: 'email',
  list: [column('email').searchable(), column('name'), column('created_at').format('since')],
  canView: (user) => !!user,
  canEdit: (user) => !!user,
})

export default [postsResource, tagsResource, usersResource]
