---
'vike-crud': patch
---

vike-crud: `crudBlocks()` now rejects resource-level authorization keys instead of silently dropping them (closes #690).

`crud({ scope, canView, canEdit })` reads like it scopes rows and gates edits, but on the `crudBlocks()` / block path those functions were silently stripped to keep the block descriptor serializable — so a page built with `crudBlocks({ table, scope, canEdit })` shipped rows unscoped and edits ungated, with no error. Enforcement lives only on `defineCrud` (server-side page meta) and vike-admin's `defineResource` (its data layer).

`crudBlocks()` now throws when handed any of `scope` / `query` / `onCreate` / `canIndex` / `canView` / `canCreate` / `canEdit` / `canDelete`, naming the key and pointing at `defineCrud('<table>', { ... })`. UI-only config (`list` / `record` / `form` / `slots`) is unchanged. `crud()` itself is untouched — it stays the shared config builder that vike-admin's `defineResource` passes auth keys through to enforce. The README and `crud()` JSDoc no longer teach the unenforced `crud({ canView, scope })` example; they point to `defineCrud` for scoping and gates.
