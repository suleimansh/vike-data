// The framework-agnostic login-page guard, shared by the react/ and vue/ subpath
// re-exports (react/loginGuard.js, vue/loginGuard.js) — the guard reads only Vike's
// own `pageContext` + `vike/abort`, so both frameworks run the byte-identical logic
// from here instead of keeping two copies that can drift.
//
// `guard`: a signed-in visitor has no business on the sign-in form, so bounce them
// to the app's post-login home. The destination is the `loginRedirect` config key
// (declared in +config.js, default '/'), so the app sets where signed-in users
// belong — `loginRedirect: '/admin'`.
//
// `user` is resolved by the server tier (onCreatePageContext) and passed to the
// client, so this works on first load (server-side redirect) and on client-side
// navigation alike. Referenced from +config.js by pointer import, like the pages.
import { redirect } from 'vike/abort'
import { sanitizeNext } from './safe-redirect.js'

// The shared redirect tail: send an already-signed-in visitor where they were headed.
// If they arrived with ?next=… (a guard bounced them here from a protected page),
// prefer that — validated to a local path so it can never become an open redirect —
// over the configured home. Reused by the default guard (below) and the named-guard
// login guard (react/guardLoginGuard.js) so the destination rule lives once.
export function redirectSignedIn(pageContext) {
  const next = sanitizeNext(pageContext.urlParsed?.search?.next)
  throw redirect(next || pageContext.config?.loginRedirect || '/')
}

export function guard(pageContext) {
  if (!pageContext.user) return // not signed in: render the form
  redirectSignedIn(pageContext)
}
