---
'vike-push': minor
---

Adopt vike-csrf on the subscribe/unsubscribe POSTs (#705). The middleware verifies the caller before resolving the user (cross-origin browser -> 403) and demands `application/json` on its two owned endpoints (415, killing the text/plain form-POST trick). An unknown /push/ path stays a 404; non-browser callers are untouched. Policy comes from the shared `csrf` / `csrfExempt` config keys.
