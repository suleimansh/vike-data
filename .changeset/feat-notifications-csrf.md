---
'vike-notifications': minor
---

Adopt vike-csrf on the mark-read POST (#706). The middleware verifies the caller before resolving the user (cross-origin browser -> 403) and demands `application/json` (415, killing the text/plain form-POST trick). The GET feed reads are safe methods and untouched; policy comes from the shared `csrf` / `csrfExempt` config keys.
