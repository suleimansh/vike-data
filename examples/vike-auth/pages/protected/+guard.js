// A guarded route: only signed-in visitors may see /protected. `pageContext.user` is resolved
// by vike-auth's server tier (onCreatePageContext) from the session cookie, on first load AND
// on client-side navigation (the hook is server-only, so Vike round-trips to re-resolve it), so
// this guard is correct in both. An unauthenticated visitor is bounced to /login carrying
// ?next=/protected; vike-auth's login flow validates that (never an open redirect) and returns
// them here after sign-in.
import { redirect } from 'vike/abort'

export function guard(pageContext) {
  if (!pageContext.user) {
    throw redirect(`/login?next=${encodeURIComponent(pageContext.urlPathname)}`)
  }
}
