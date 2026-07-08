// The actions endpoint with an RBAC-AWARE user resolver. vike-actions' default endpoint
// resolves the bare session user (no roles/permissions), so an action guard written as
// can(ctx.user, ...) would always deny; pages don't have this problem because vike-rbac
// enriches through vike-auth's resolveUser seam, and Telefunc has its own context bridge
// (vike-rbac/telefunc-context). Until vike-actions grows the same seam, the app swaps the
// resolver: same session lookup, then the same resolveAccessForUser the page path uses.
//
// Wired as the app's `middleware` pointer in +config.js (INSTEAD of extending
// vike-actions/config, whose default endpoint would answer first with the unenriched user).
// Importing ./actions.js registers the app's actions as a side-effect, so this one pointer
// both populates the registry and installs the handler.
import { createActionsHandler } from 'vike-actions/endpoint'
import { resolveSessionUser } from 'vike-auth/server'
import { resolveAccessForUser } from 'vike-rbac/resolve'
import './actions.js'

export default createActionsHandler({
  async resolveUser(request) {
    const user = await resolveSessionUser(request)
    if (!user) return null
    const access = await resolveAccessForUser(user.id)
    return { ...user, ...access }
  },
})
