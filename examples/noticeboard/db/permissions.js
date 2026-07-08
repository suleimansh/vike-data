// The permission set this app advertises into vike-rbac's cumulative registry. One source of
// truth shared by the standalone seed (db/seed.js) and the dev-convenience boot seed
// (pages/+onCreateGlobalContext.js): seedRbac DERIVES the roles, the permissions, and the
// role->permission grants from it. `member` grants nothing, so it is a standalone role passed for
// default-role-on-signup.
//
// The noticeboard model: everyone signed-in reads the board; `editor` (and admin) can post
// announcements; only `admin` manages users. Publishing is gated by `announcements.post` in the
// action (server) AND the /announcements/new guard (page), the same can() everywhere.
import { definePermissions } from 'vike-rbac'

export const appPermissions = definePermissions([
  { name: 'users.view', label: 'View users', roles: ['admin'] },
  { name: 'users.edit', label: 'Edit users', roles: ['admin'] },
  { name: 'announcements.post', label: 'Post announcements', roles: ['admin', 'editor'] },
])

export const standaloneRoles = ['member']
