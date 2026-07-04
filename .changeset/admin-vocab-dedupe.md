---
'vike-admin': minor
---

vike-admin: adopt the defineCrud screen vocabulary (`index` / `view` / `edit`) and dedupe shared helpers onto vike-crud (part of #582, closes #591).

- **Vocabulary**: `defineResource` now takes `index` (list columns), `view` (record/detail fields) and `edit` (the create + edit form) — the same words `defineCrud` uses, so a table reads the same in an admin resource as in a per-page resource. `create` is accepted as an alias for `edit` (admin renders a single form; create inherits edit). The old block keys `list` / `record` / `form` are no longer an authoring surface — there is one vocabulary, not two. Migrated the four example apps, the tests, and the docs.
- **Dedupe**: vike-admin's `data.js` now reuses vike-crud's `primaryKeyOf` and `rowFromForm` (a widget-aware superset of the copy it carried) instead of duplicating them. The `define` / `resolve` / `query` / `project` modules were already thin re-exports of vike-crud; the remaining admin-specific engine (the Vike page hooks, the JSON agent API, the `in`-validating write ownership, the resource-registry FK loading) stays.
