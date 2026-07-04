---
'vike-admin': minor
'vike-crud': minor
---

vike-admin: migrate the authorization model to defineCrud's shape (query / onCreate / canX / .when) (part of #582, closes #589).

vike-admin's resources used the pre-defineCrud auth surface — `scope: (user) => filter`, `canView: (user)`, `canEdit: (user)`. This aligns them with the `defineCrud` model so the two layers speak one vocabulary:

- **Read scope** `scope(user)` -> `query(q, ctx)`, a query-builder callback (equality + `in`, mirroring universal-orm). AND-merged into list/load/update/delete; its scalar columns are still forced onto writes.
- **Write stamp** new `onCreate(ctx)` -> columns forced onto inserts (e.g. the owner), so a scoped user can't create a row owned by someone else.
- **Gates** the single `canView(user)` / `canEdit(user)` split into per-screen `canIndex(ctx)` / `canCreate(ctx)` (list + create) and record-level `canView(record, ctx)` / `canEdit(record, ctx)` / `canDelete(record, ctx)`. `canEdit`/`canDelete` are evaluated against the loaded row, so the list now stamps per-row `_canEdit` / `_canDelete` and drives the row's Edit link / Delete control from them; the "New" button reads `canCreate`. The edit hook loads the row THEN gates.
- **Per-field visibility** `.when(ctx)` on any column/display/field: a hidden list column's data never ships to the client, and a hidden form field is not writable.

`vike-crud` adds a `./authz` subpath export (`runQuery` / `queryScope` / `allow` / `keepVisible`) that vike-admin consumes. The old `canView` / `canEdit` helpers are no longer re-exported from `vike-admin/resolve`.
