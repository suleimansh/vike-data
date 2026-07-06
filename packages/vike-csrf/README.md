# vike-csrf

CSRF defense for the vike-data extension family. Origin verification is the primary
defense; there is no token machinery (v1, by design).

## The model

CSRF is a browser attack: a page on `evil.example.com` makes the victim's browser send a
state-changing request to your app, with the victim's cookies attached. Modern browsers
always send an `Origin` header on cross-origin POSTs and `Sec-Fetch-Site` on everything,
and a page cannot strip either. So comparing those headers against the request's own
origin blocks the attack, while callers that send neither header (curl, server-to-server,
the admin agent API) pass untouched: they are not browsers, so they are not CSRF vectors.

## The three tiers

```js
import { checkSameOrigin, requireJsonContent, csrfGuard } from 'vike-csrf'

// 1. The pure verdict. No config, no Response. { ok: true } or { ok: false, reason }.
checkSameOrigin(request, { allowedOrigins: ['https://admin.example.com'] })

// 2. The content-type verdict: kills the text/plain form-POST trick.
requireJsonContent(request)

// 3. The composite an endpoint extension calls first thing in its middleware.
//    Reads the app's `csrf` / `csrfExempt` config; null (pass) or a 403 JSON Response.
const denied = csrfGuard(request)
if (denied) return denied
```

The rules `checkSameOrigin` applies, in order:

1. `GET` / `HEAD` / `OPTIONS` pass (they must be side-effect free anyway).
2. `Sec-Fetch-Site: same-origin` passes; so does `none` (user-initiated, which an
   attacker page cannot produce).
3. Otherwise the `Origin` header must equal the request's own origin or be allowlisted.
   `Origin: null` (sandboxed iframe, `data:` URL) is opaque and never matches.
4. Neither header present passes: a non-browser caller.

## Config

Two keys, declared once by this package:

```js
// The app's +config.js
export default {
  // App-wide policy. Both fields optional; the default is enforce on, empty allowlist.
  csrf: {
    allowedOrigins: ['https://admin.example.com'], // e.g. a trusted second origin, or the
                                                   // public origin when behind a proxy
    enforce: true, // false = log the would-be rejection, let the request through
  },
}
```

`csrfExempt` is the cumulative coordination seam: an extension contributes its
signature-verified webhook paths itself, the app never lists them.

```js
// vike-stripe's +config.js (the adopter shape, #707)
export default {
  name: 'vike-stripe',
  extends: ['import:vike-csrf/config:default'],
  csrfExempt: ['/webhooks/stripe'], // exact path, or a trailing wildcard '/webhooks/*'
}
```

Exemption entries match exactly, or by a trailing `/*` wildcard. Plain prefixes are
deliberately not supported: `/webhooks/stripe` must not also exempt
`/webhooks/stripe-evil`.

## Adopting (for extension authors)

One `extends` entry plus one guard call:

```js
// +config.js
export default {
  name: 'my-ext',
  extends: ['import:vike-csrf/config:default'],
  middleware: 'import:my-ext/endpoint:default',
}
```

```js
// endpoint.js
import { csrfGuard } from 'vike-csrf'

export default async function endpoint(request) {
  if (!isMyPath(request)) return
  const denied = csrfGuard(request)
  if (denied) return denied
  // ... handle
}
```

Call the guard by default, not behind an option: installing your extension alone must be
protected, with no opt-in. Many extensions extending vike-csrf is the intended shape; the
extends graph is a diamond exactly like vike-schema's `schemas`, Vike dedupes the shared
extension, and the `meta` declaration stays single. Contribute values, never re-declare
the meta.

## How the config reaches the guard

A universal middleware cannot read Vike config (there is no pageContext). vike-csrf wires
an `onCreateGlobalContext` hook (`bootstrap.js`) that copies the resolved `csrf` +
`csrfExempt` values into module-level settings once, at globalContext creation, which
happens before any request reaches a middleware. Unconfigured means the secure default:
enforce on, no extra origins, no exemptions.

## Proxies

Behind a reverse proxy the request's own origin may be the internal one
(`http://localhost:3000`) while browsers send the public origin. List the public origin
in `csrf.allowedOrigins` for that deployment. `X-Forwarded-Host` is spoofable and is
deliberately not consulted.

## Tokens

Deliberately absent in v1. Origin verification covers the browsers the family targets;
token mint/verify would land in this same package if real demand appears (minting would
sit with vike-auth as the session owner). See epic #699.
