// The fail-closed dev-server derivation the default wiring (vike-middleware.js) and the
// guards wiring (guards-middleware.js) both pass to their middleware. Kept in one place so
// this security-sensitive default can't drift between the two entry points.
//
// Only the local dev server gets a non-Secure cookie + the inline magic-link convenience,
// detected from the POSITIVE signal NODE_ENV='development' (Vite/Vike sets it on its dev
// server). Any other value (unset, 'staging', 'prod', a typo) keeps `Secure` on, so
// forgetting `NODE_ENV=production` in a deployment can no longer ship the session cookie
// over plain HTTP.
export function devServerFlags() {
  const dev = process.env.NODE_ENV === 'development'
  return { dev, secure: !dev }
}
