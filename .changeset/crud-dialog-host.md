---
'vike-crud': minor
---

vike-crud: URL-synced dialog host for `mode: 'dialog'` resources (part of #575, closes #578).

On a dialog-mode resource the view / create / edit screens open as overlays over the list, and which one is open is read straight from the URL — so a dialog is shareable and survives a refresh.

- **URL state.** `?view=<id>` / `?edit=<id>` open the record / edit dialog for a row; `?create` opens the create dialog. `activeDialog(search)` resolves the open dialog (view > edit > create).
- **Server-rendered dialog data.** The data hook hydrates ONLY the section the URL activated (the list and the other folded dialogs stay blank), so refreshing `/posts?view=p1` renders the record dialog already populated. A `?view=` miss leaves the dialog empty rather than 404-ing the list.
- **The host.** `CrudDialog` reuses vike-blocks' `Overlay` (portal + focus-trap + Escape + backdrop-click + scroll-lock), driving `open` from the URL instead of a trigger button; closing navigates back to the list route (clearing the query). Theme-native (`var(--color-*)` / `--radius`).
- **`ViewPage`** now honours each section's `present`: route/inline sections draw in place; the list gets row links (`?view` / `?edit`) and a "New" link (`?create`) — plain `<a>`s the client router turns into navigations; dialog sections are held back for the host. A create/edit form inside a dialog POSTs to the current URL and the existing scoped write path redirects back to the list, closing it.

The legacy single-page `crudBlocks` flow is unchanged (no `present` = drawn in place, no row links).
