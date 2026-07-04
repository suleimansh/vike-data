---
'vike-crud': minor
---

vike-crud: `defineCrud(table, opts?)` — the CRUD resource expander (part of #575, closes #576).

Declare a table as a CRUD resource and derive its pages (index / view / create / edit) instead of stacking a fixed `list` + `record` + `form` triad onto one page. `defineCrud` is a pure function that expands to the explicit `definePage[]` primitive, so it is fully testable and stays the intent layer over page composition.

- One vocabulary, one word per page: `index` / `view` / `create` / `edit`. A page key carries its refinement (`index: [column(...)]`), `{ mode, fields }` overrides that screen's presentation, `false` drops it, and an absent key derives every field from the schema. `create` mirrors `edit`'s fields when unset.
- `mode: 'route' | 'dialog' | 'inline'` (default `dialog`) chooses presentation. Route-mode screens become their own pages (`/posts`, `/posts/@id`, `/posts/new`, `/posts/@id/edit`); dialog/inline screens fold onto the index page tagged with their `present`, so the index route stays list-only until a screen is triggered — no more empty stacked record block.
- Resource-level auth (`query` / `onCreate` / `canIndex` / `canView` / `canCreate` / `canEdit` / `canDelete`) rides on server-only page metadata, never in a serialized section.
- New per-screen sugar `crud.index/view/create/edit(table, refinement?)` returns the block(s) for one screen, to drop into a hand-written `definePage`.

This is the expander only; route/data/dialog wiring and auth enforcement land in the follow-up children of #575.
