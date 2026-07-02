---
'vike-crud': minor
'vike-admin': patch
---

Rename `vike-view` -> `vike-crud` and drop the `defineView` alias (closes #509).

The package is entirely the schema -> CRUD layer (list/record/form derived from a table, owner-scoped data, page-gen, eject), so `vike-crud` names what it does and reads right with the graph (`vike-admin` sits on `vike-crud`).

- Package renamed `vike-view` -> `vike-crud`; all subpath exports keep their names (`vike-crud/react/pages`, `vike-crud/react`, `vike-crud/vue`, ...).
- `defineView` is gone. It was `definePage` plus a side-effect that registered the crud blocks; importing anything from `vike-crud` already registers those blocks, so general page composition is now just `definePage` (re-exported from vike-blocks) and CRUD screens are `crud({ table })`. One fewer fuzzy verb.

Migration:
- `import { defineView } from 'vike-view'` -> `import { definePage } from 'vike-crud'`
- `defineView({ route, sections })` -> `definePage({ route, sections })`
- update the package name in imports and dependencies: `vike-view` -> `vike-crud`
