---
'vike-crud': minor
---

vike-crud: param routes + load-by-id + the update/delete write path (part of #575, closes #577).

The generic view data hook now serves a resource's per-screen routes, not just a single list page. This is the load-bearing piece the dialog host (#578) and renderer (#579) build on.

- **Param-aware routing.** `resolveViewRequest(views, pathname)` (and the underlying `matchRoute`) resolve a pathname to its view plus captured route params, with static segments beating `@param` — so `/posts/new` picks the create screen over `/posts/@id`. `viewForRoute` now matches param routes too.
- **Load-by-id.** The `record` block (view screen) and the `form` block (edit screen) load one row keyed on the primary key AND the owner scope, from the route's `@id`. A non-owned or missing id yields a null row/values, which the data hook turns into a 404 — another owner's row never reaches the client. The create screen's form stays blank.
- **Write path.** POST keys create / update / delete on the route `id` (or the legacy form `_id`), honours `_action=delete`, and redirects to the resource's index route (`crud.base`). Update and delete re-assert the scope, so a scoped user can only mutate a row they own.
- `defineCrud` now records the resource's index route as `crud.base` on each emitted page.
