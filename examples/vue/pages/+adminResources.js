import { defineResource, column, field } from 'vike-admin/define'
import { can, hasRole } from 'vike-rbac'

const usersResource = defineResource({
  table: 'users',
  label: 'Users',
  recordTitle: 'email',
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
  // defineCrud auth model (#581): listing needs `users.view`; create/edit/delete need `users.edit`.
  canIndex: (ctx) => can(ctx.user, 'users.view'),
  canCreate: (ctx) => can(ctx.user, 'users.edit'),
  canEdit: (record, ctx) => can(ctx.user, 'users.edit'),
  canDelete: (record, ctx) => can(ctx.user, 'users.edit'),
})

const sessionsResource = defineResource({
  table: 'sessions',
  label: 'Sessions',
  index: [column('user_id').label('User'), column('token'), column('created_at').format('since')],
  edit: [
    field('user_id'),
    field('token').required(),
  ],
  canIndex: (ctx) => !!ctx.user,
  // Row scoping (#104): an admin reads every session; anyone else is bounded to their own via the
  // `query` builder, and `onCreate` stamps the owner onto inserts.
  query: (q, ctx) => (hasRole(ctx.user, 'admin') ? q : q.where('user_id', ctx.user.id)),
  onCreate: (ctx) => ({ user_id: ctx.user.id }),
})

export default [usersResource, sessionsResource]
