---
'vike-storage': minor
---

Adopt vike-csrf on the upload write paths (#704). The middleware verifies the caller before resolving the user: a cross-origin browser POST /uploads or DELETE /uploads/:id gets a 403 and never touches the session. The GET reads are safe methods and pass; non-browser callers are untouched. Policy comes from the shared `csrf` / `csrfExempt` config keys.
