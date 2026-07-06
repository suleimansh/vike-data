---
'vike-auth': minor
---

Adopt vike-csrf on the auth write paths (#701). The shared handler (default guard and every named guard) calls `csrfGuard` before dispatching, so the login/logout POSTs, the classic CSRF targets, reject cross-origin browsers with a 403 (HTML, matching the surface). Policy comes from the shared `csrf` / `csrfExempt` config keys; the GET callback is a safe method and passes; non-browser callers are untouched.
