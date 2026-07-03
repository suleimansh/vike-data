// Guard for a named guard's login page: a visitor already signed into THIS guard has no
// business on its sign-in form, so bounce them to the app's post-login home. The
// multi-guard twin of loginGuard.js — it checks `pageContext.guards[<authGuard>].user`
// (this guard's session) rather than the default `pageContext.user`, so being signed into
// the `client` guard does NOT bounce you off the `admin` login.
//
// `authGuard` is the per-page config the app sets on each guard login route; the guard
// users are resolved by guards-oncreate.js into pageContext.guards. Referenced from the
// app's page entry by pointer import, like the default loginGuard.
//
// Only the user-resolution differs from the default loginGuard; the "bounce a signed-in
// visitor to next || loginRedirect" tail is the shared redirectSignedIn.
import { redirectSignedIn } from '../login-guard.js'

export function guard(pageContext) {
  const name = pageContext.config?.authGuard
  const user = name ? pageContext.guards?.[name]?.user : null
  if (!user) return // not signed into this guard: render the form
  redirectSignedIn(pageContext)
}
