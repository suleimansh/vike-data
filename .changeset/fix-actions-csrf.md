---
'vike-actions': patch
---

The action endpoint now defends itself (#677): it self-installs vike-csrf and calls `csrfGuard` + `requireJsonContent` by default. A cross-origin browser POST gets a 403 (Origin / Sec-Fetch-Site verification; non-browser callers pass), and a non-`application/json` body gets a 415, killing the `text/plain` form-POST trick. Policy comes from the shared `csrf` / `csrfExempt` config keys; the client bindings already send `Content-Type: application/json`, so well-behaved callers see no change.
