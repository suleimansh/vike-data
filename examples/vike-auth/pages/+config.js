// The whole app is one install: vike-react (the renderer) + vike-auth/react. That single
// auth import brings THREE things at once — the server-side session tier (resolves
// `pageContext.user` from the session cookie), the auth strings, AND the extension's own
// /login + /account pages (via config.pages, vike#3356) — so there is no page file in this
// app for either route. A guard on /login bounces an already-signed-in visitor to
// `loginRedirect`.
import vikeReact from 'vike-react/config'
import authExt from 'vike-auth/react'

export default {
  extends: [vikeReact, authExt],
  // Where a signed-in visitor who hits /login is sent (default '/'). Also where /account
  // links back to. The guarded /protected page sends unauthenticated visitors the other way
  // (to /login?next=/protected) from its own +guard.js.
  loginRedirect: '/account',
  title: 'vike-auth example',
}
