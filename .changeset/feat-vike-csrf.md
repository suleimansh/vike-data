---
'vike-csrf': minor
---

New package **vike-csrf**: CSRF defense for the extension family, origin verification first, no token machinery (#700, keystone of #699).

- `checkSameOrigin(request, { allowedOrigins })`: GET/HEAD/OPTIONS pass; `Sec-Fetch-Site: same-origin` (and `none`) passes; otherwise `Origin` must equal the request's own origin or be allowlisted; neither header present passes (non-browser caller, not a CSRF vector).
- `requireJsonContent(request)`: rejects non `application/json` bodies (kills the `text/plain` form-POST trick).
- `csrfGuard(request)`: the composite endpoint extensions call by default; exemptions + origin check + enforce knob, returning `null` or a 403 JSON Response. Unconfigured means the secure default (enforce on, nothing allowed, nothing exempt).
- Declares the app-wide `csrf` config key (`allowedOrigins`, `enforce`) and the cumulative `csrfExempt` seam extensions contribute their signature-verified webhook paths to (exact path or trailing `/*` wildcard).
- An `onCreateGlobalContext` hook bridges the resolved config to the runtime settings, since a universal middleware cannot read config.
- Zero dependencies, server-only. Adoption by the endpoint extensions is #677 and #701 to #707.
