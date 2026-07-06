---
'vike-crud': minor
---

Adopt vike-csrf on the write paths (#703). The generic data hook (`viewData`, route pages and dialog forms alike) verifies the caller before reading a POST body: a cross-origin browser form POST aborts with `render(403)` and never reaches the write. New `csrfRequestOf(pageContext)` in `vike-crud/request` normalizes the two request surfaces (server adapter Web Request, raw Node request under vite dev) for the check; ejected pages get the same guard in their generated data hook. Policy comes from the shared `csrf` / `csrfExempt` config keys; non-browser callers are untouched.
