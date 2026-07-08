// The app's contribution to vike-admin's cumulative `adminResources` point. A resource carries
// FUNCTIONS (query / onCreate / canX), so it lives in its own pointer-imported +<configName>.js
// file rather than inline in +config.js. The gates delegate to the same can()/hasRole() the
// publish action and the page guards use: one RBAC model everywhere.
import { defineResource, column, field } from 'vike-admin/define'
import { can, hasRole } from 'vike-rbac'

const usersResource = defineResource({
  table: 'users',
  label: 'Users',
  recordTitle: 'email', // how a user is labeled where it's referenced (FK selects)
  index: [
    column('email').sortable().searchable(),
    column('name'),
    column('active'),
    column('created_at').label('Joined').format('since'),
  ],
  edit: [
    field('email').type('email').required(),
    field('name'),
    field('active'),
  ],
  canIndex: (ctx) => can(ctx.user, 'users.view'),
  canCreate: (ctx) => can(ctx.user, 'users.edit'),
  canEdit: (record, ctx) => can(ctx.user, 'users.edit'),
  canDelete: (record, ctx) => can(ctx.user, 'users.edit'),
})

// The board's content, manageable from /admin too: posters (announcements.post) see and edit the
// board; the author FK renders as a user picker via the composed-schema introspection. Publishing
// from the app (/announcements/new) additionally fans out notifications; an admin edit here is
// just data repair and notifies no one.
const announcementsResource = defineResource({
  table: 'announcements',
  label: 'Announcements',
  recordTitle: 'title',
  index: [
    column('title').sortable().searchable(),
    column('author_id').label('Author'),
    column('created_at').label('Posted').format('since'),
  ],
  edit: [
    field('title').required(),
    field('body').type('longtext').required(),
    field('author_id'),
  ],
  canIndex: (ctx) => can(ctx.user, 'announcements.post'),
  canCreate: (ctx) => can(ctx.user, 'announcements.post'),
  canEdit: (record, ctx) => can(ctx.user, 'announcements.post'),
  canDelete: (record, ctx) => can(ctx.user, 'announcements.post'),
})

const sessionsResource = defineResource({
  table: 'sessions',
  label: 'Sessions',
  index: [column('user_id').label('User'), column('token'), column('created_at').format('since')],
  edit: [
    field('user_id'), // FK -> rendered as a user picker
    field('token').required(),
  ],
  canIndex: (ctx) => !!ctx.user,
  // Row scoping backed by RBAC: an admin reads every session; anyone else is bounded to their own.
  query: (q, ctx) => (hasRole(ctx.user, 'admin') ? q : q.where('user_id', ctx.user.id)),
  onCreate: (ctx) => ({ user_id: ctx.user.id }),
})

export default [usersResource, announcementsResource, sessionsResource]
