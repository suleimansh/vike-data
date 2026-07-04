---
'vike-crud': minor
---

vike-crud: `ejectCrud` reveals a `defineCrud` resource as its explicit pages, and the example migrates to `defineCrud` (closes #580, the last of #575).

- `ejectCrud(pages)` is the resource-level twin of `ejectView`: given the `definePage[]` a `defineCrud(...)` returns, it emits that array as plain, owned source built from the primitive tier -- `definePage({ route, sections })` with `crud.index / crud.view / crud.create / crud.edit` for the screens, plus the `present` / `screen` / `nav` / `crud` metadata the resource attached. The resource's server-only auth functions (`query` / `onCreate` / `canX`) are hoisted to named consts. The emitted array is the same object graph, so it round-trips: the ejected pages render identically through the same `viewPages` path. A round-trip test evaluates the emitted source and deep-compares it to the original for all three modes.
- `examples/vike-crud`: the primary `/posts` page moves from a hand-arranged `crudBlocks` triad (which stacked an empty `record` block on the list) to `defineCrud('posts', { ... })` in `dialog` mode, so the index is list-only until a screen is triggered. A second `/posts-route` resource demonstrates `route` mode (per-screen detail pages). README + landing page updated to describe the resource surface and the three presentation modes.
