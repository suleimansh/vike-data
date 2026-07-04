// The app's contribution to vike-admin's cumulative `adminResources` point -- copied verbatim
// from examples/react (minus the storage `avatar` field, which this trimmed example omits) to
// make the point concrete: the admin layer is IDENTICAL on a real database. A resource carries
// FUNCTIONS (query / onCreate / canX), so it lives in its own pointer-imported +<configName>.js
// file rather than inline in +config.js.
import { defineResource, column, field } from 'vike-admin/define'
import { can, hasRole } from 'vike-rbac'

const usersResource = defineResource({
  table: 'users',
  label: 'Users',
  recordTitle: 'email', // how a user is labeled where it's referenced (e.g. the sessions FK select)
  list: [
    column('email').sortable().searchable(),
    column('name'),
    column('active'),
    column('created_at').label('Joined').format('since'),
  ],
  form: [
    field('email').type('email').required(),
    field('name'),
    field('active'),
    // id / password_hash / timestamps are auto-hidden by convention.
  ],
  // RBAC: the admin gates delegate to the same can() the rest of the app shares. defineCrud (#581)
  // splits them per-screen: listing needs `users.view`; create/edit/delete need `users.edit`. Sign
  // in as ada@example.com (admin -> both) to see + edit Users; alan@example.com (member) is denied
  // both, so the Users resource disappears from /admin for him.
  canIndex: (ctx) => can(ctx.user, 'users.view'),
  canCreate: (ctx) => can(ctx.user, 'users.edit'),
  canEdit: (record, ctx) => can(ctx.user, 'users.edit'),
  canDelete: (record, ctx) => can(ctx.user, 'users.edit'),
})

// A second resource on `sessions` whose `user_id` references `users.id`. vike-admin renders it as
// a SELECT of users, labeled by the users resource's recordTitle ('email') instead of a raw uuid
// -- composed-schema FK introspection, now over real Postgres FKs.
const sessionsResource = defineResource({
  table: 'sessions',
  label: 'Sessions',
  list: [column('user_id').label('User'), column('token'), column('created_at').format('since')],
  form: [
    field('user_id'), // FK -> rendered as a user picker
    field('token').required(),
  ],
  canIndex: (ctx) => !!ctx.user,
  // Row scoping backed by RBAC: an admin reads every session; anyone else is bounded to their own
  // via the `query` builder, and `onCreate` stamps the owner onto inserts.
  query: (q, ctx) => (hasRole(ctx.user, 'admin') ? q : q.where('user_id', ctx.user.id)),
  onCreate: (ctx) => ({ user_id: ctx.user.id }),
})

export default [usersResource, sessionsResource]
