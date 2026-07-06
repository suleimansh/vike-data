---
'vike-admin': minor
---

Adopt vike-csrf on both admin write surfaces (#702). The /new and /:id/edit form POSTs verify the caller (`csrfGuard` via `csrfRequestOf`) before reading the body, aborting with `render(403)` on a cross-origin browser. The agent API writes (POST/PATCH/DELETE) get the same origin check as a 403 JSON Response plus `requireJsonContent` (415) on the body-carrying verbs, both before any page render. Non-browser agents pass untouched; policy comes from the shared `csrf` / `csrfExempt` config keys.
