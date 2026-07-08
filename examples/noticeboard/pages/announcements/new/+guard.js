// Page gate: signed-out goes to login (and comes back), signed-in without the permission is
// told no. The same can() the publish action re-checks server-side; the guard is UX, the
// action's guard is the enforcement.
import { redirect, render } from 'vike/abort'
import { can } from 'vike-rbac'

export function guard(pageContext) {
  if (!pageContext.user) throw redirect(`/login?next=${encodeURIComponent(pageContext.urlPathname)}`)
  if (!can(pageContext.user, 'announcements.post')) throw render(403, 'Posting is for editors and admins.')
}
