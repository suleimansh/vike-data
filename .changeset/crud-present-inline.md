---
'vike-crud': minor
---

vike-crud: honour `present` in the renderer — inline mode + unified list navigation (part of #575, closes #579).

Completes the `route` / `dialog` / `inline` presentation dispatch on the generated page.

- **No empty CRUD blocks.** `sectionHasContent` keeps an in-place section off the page unless it has something to show: a `record` needs a row, an edit `form` needs a loaded row; a create form (blank inputs are the point) and any list/heading/text always render. This is the guard that finally kills the empty `<dl>` in every mode — including inline, where the folded view/edit sections have no row on the index.
- **Inline mode.** `mode: 'inline'` renders the list with the create form stacked underneath, and nothing empty — the classic "list + add form" page.
- **Unified navigation.** `defineCrud` attaches a `nav` descriptor to the index list describing how each screen is reached; `ViewPage` wires row links + a "New" link from it: `route` -> the screen's own URL (`/posts/@id`, `/posts/new`), `dialog` -> a `?screen=id` query, `inline` -> no link (it's already on the page). So a route-mode list now links each row to its detail/edit page, and a dialog-mode list opens the overlay — from one code path.

The legacy single-page `crudBlocks` flow is unchanged (no `nav` = no injected links; an untagged create form still renders).
