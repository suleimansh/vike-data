// vike-csrf core: origin-verification CSRF defense, no token machinery (v1, by design).
//
// The model: CSRF is a BROWSER attack, and modern browsers always send an Origin header on
// cross-origin POSTs (and Sec-Fetch-Site on everything). So the primary defense is comparing
// those headers against the request's own origin. Non-browser callers (curl, server-to-server,
// the admin agent API) send neither header and pass; a browser cannot strip them.
//
// Three tiers, smallest to largest:
//   checkSameOrigin(request, { allowedOrigins })  pure verdict, no config, no Response
//   requireJsonContent(request)                   pure verdict on the Content-Type
//   csrfGuard(request, overrides?)                the composite adopters call: exemptions +
//                                                 origin check + enforce knob, from the app's
//                                                 `csrf` / `csrfExempt` config (bootstrap.js)
//
// Endpoint extensions (vike-actions, vike-auth, ...) call csrfGuard by DEFAULT, so installing
// one of them is protected with no opt-in. Settings unset means the SECURE default: enforce
// on, no extra allowed origins, no exemptions.
//
// Server-only, zero dependencies.

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

// Normalize an origin string for comparison ('https://App.example.com/' -> 'https://app.example.com').
// Non-URL values are kept verbatim so a bad allowlist entry can never widen into a match.
function normalizeOrigin(value) {
  try {
    return new URL(value).origin
  } catch {
    return value
  }
}

// The primary check. Verdict shape: { ok: true } or { ok: false, reason }.
//   - Safe methods (GET/HEAD/OPTIONS) pass: they must be side-effect free anyway.
//   - Sec-Fetch-Site 'same-origin' passes; 'none' passes too (user-initiated, e.g. a bookmark,
//     which an attacker page cannot produce).
//   - Otherwise the Origin header must equal the request's own origin or be allowlisted.
//     'null' (sandboxed iframe, data: URL) is an opaque origin and never matches.
//   - NEITHER header present passes: that is a non-browser caller, not a CSRF vector.
//
// Behind a proxy the request's own origin may be internal (http://localhost:3000) while the
// browser sends the public one; list the public origin in `allowedOrigins` for that case.
export function checkSameOrigin(request, { allowedOrigins = [] } = {}) {
  if (SAFE_METHODS.has(request.method)) return { ok: true }

  const secFetchSite = request.headers.get('sec-fetch-site')
  if (secFetchSite === 'same-origin' || secFetchSite === 'none') return { ok: true }

  const origin = request.headers.get('origin')
  if (origin === null && secFetchSite === null) return { ok: true }

  if (origin !== null) {
    const own = new URL(request.url).origin
    const normalized = normalizeOrigin(origin)
    if (normalized === own) return { ok: true }
    if (allowedOrigins.map(normalizeOrigin).includes(normalized)) return { ok: true }
    return { ok: false, reason: `cross-origin request from ${origin}` }
  }

  // Origin absent but Sec-Fetch-Site says cross-site/same-site: a browser spoke, believe it.
  return { ok: false, reason: `cross-site request (Sec-Fetch-Site: ${secFetchSite})` }
}

// The content-type check: kills the text/plain (and urlencoded) form-POST trick, which is the
// one request shape a cross-site <form> can produce without a CORS preflight. Safe methods
// pass; anything else must declare a JSON body (application/json or an application/*+json
// variant, parameters like charset allowed).
export function requireJsonContent(request) {
  if (SAFE_METHODS.has(request.method)) return { ok: true }
  const raw = request.headers.get('content-type') || ''
  const type = raw.split(';')[0].trim().toLowerCase()
  if (type === 'application/json' || type.endsWith('+json')) return { ok: true }
  return { ok: false, reason: `content-type must be application/json (got ${raw || 'none'})` }
}

// ---------------------------------------------------------------------------
// Runtime settings: the bridge from the app's `csrf` / `csrfExempt` config.
//
// A universal middleware cannot read Vike config (no pageContext), so the +config hook
// (bootstrap.js) copies the resolved values here ONCE at globalContext creation, which happens
// before any request reaches a middleware. Unconfigured means the secure default.

const DEFAULTS = Object.freeze({ allowedOrigins: [], enforce: true, exempt: [] })
let settings = { ...DEFAULTS }

export function configureCsrf({ allowedOrigins, enforce, exempt } = {}) {
  if (allowedOrigins !== undefined) settings.allowedOrigins = allowedOrigins
  if (enforce !== undefined) settings.enforce = enforce
  if (exempt !== undefined) settings.exempt = exempt
}

export function csrfSettings() {
  return { ...settings, allowedOrigins: [...settings.allowedOrigins], exempt: [...settings.exempt] }
}

// Test seam, mirrors the kit ports' clear().
export function resetCsrf() {
  settings = { ...DEFAULTS }
}

// An exemption entry is an exact pathname ('/webhooks/stripe') or a trailing-wildcard prefix
// ('/webhooks/*'). Plain prefixes are deliberately NOT supported: '/webhooks/stripe' must not
// also exempt '/webhooks/stripe-evil'.
export function isExempt(pathname, exempt = settings.exempt) {
  return exempt.some((entry) =>
    entry.endsWith('/*')
      ? pathname === entry.slice(0, -2) || pathname.startsWith(entry.slice(0, -1))
      : pathname === entry,
  )
}

// The composite guard adopters call first thing in their endpoint middleware:
//
//   const denied = csrfGuard(request)
//   if (denied) return denied
//
// Returns null (pass) or a 403 JSON Response. `overrides` (same keys as the `csrf` config)
// is for direct callers and tests; extensions normally pass nothing and get the app config.
export function csrfGuard(request, overrides) {
  const active = overrides ? { ...settings, ...overrides } : settings
  const { pathname } = new URL(request.url)
  if (isExempt(pathname, active.exempt)) return null

  const verdict = checkSameOrigin(request, { allowedOrigins: active.allowedOrigins })
  if (verdict.ok) return null

  if (!active.enforce) {
    console.warn(`[vike-csrf] would reject ${request.method} ${pathname}: ${verdict.reason} (enforce: false)`)
    return null
  }
  return new Response(JSON.stringify({ error: 'Cross-origin request rejected' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}
