---
'vike-crud': minor
---

vike-crud: the defineCrud authorization model — `query` / `onCreate` / `canX` / `.when` (part of #575, closes #581).

Three axes of access control on a resource, all evaluated server-side (the `views` config point is server-only), so no predicate serializes to the client and a hidden field's data never leaves the server.

- **`query` — which rows (read scope).** A query-builder callback `(q, ctx) => q.where('user_id', ctx.user.id)` that mirrors universal-orm's filter surface (equality + `{ in }`). Returning the builder unrefined is the admin bypass (unscoped). Adapted into the existing owner-scoping, so it bounds every read and is forced onto writes.
- **`onCreate` — the write stamp.** `(ctx) => ({ user_id: ctx.user.id })` forced onto inserts, overriding a client-forged value — so a scoped user can't create a row owned by someone else even when `query` allows everything. Update/delete need nothing extra: they can only touch a row `query` lets you load.
- **`canIndex` / `canView` / `canCreate` / `canEdit` / `canDelete` — the page/action gate.** `canIndex`/`canCreate` take `(ctx)`; `canView`/`canEdit`/`canDelete` take `(record, ctx)` (the loaded row) and may be async. Missing = allowed; a false/false-returning predicate makes the screen or write a 403.
- **`.when((ctx) => …)` — per-field visibility.** On any `column` / `display` / `field`. A hidden field is dropped from the resolved view-model AND its row data is never projected, so it never reaches the client — and the write path drops it too, so a forged hidden field in a POST is ignored.

New helpers: `queryScope` / `runQuery` (query builder), `allow` (predicate gate), `keepVisible` (field visibility), `loadOwnedRow`. The generic view data hook now enforces all four for defineCrud pages; the legacy `scope` contract still works for hand-written views.
