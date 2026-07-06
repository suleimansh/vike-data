---
'vike-admin': patch
---

vike-admin: drain the review backlog (DX + docs drift) (closes #682).

- **Missing package exports.** `vike-admin/project` and `vike-admin/react/FormFields` were documented as re-exports but not in the `exports` map, so importing them threw `ERR_PACKAGE_PATH_NOT_EXPORTED`. Both are now exported.
- **Vue edit-delete ignored the theme.** The Vue `EditPage` delete button hardcoded `#dc2626` instead of the `var(--color-danger, #c0392b)` every other delete control (React `EditPage`, Vue `ViewPage`/`AdminDialog`) uses. It now follows the theme danger color.
- **Wide tables clipped.** Both `ListPage` twins wrapped the table in `overflow: 'hidden'`, clipping wide tables on narrow screens with no horizontal scroll. Both now use `overflowX: 'auto'` (follow-up to #674).
- **`singular()` mangled common labels.** The page-heading singularizer was a bare `/s$/` strip (Categories to Categorie, Status to Statu, Address to Addres). It now handles `-ies`/`-es` endings and leaves genuine `-ss`/`-us`/`-is` words intact.
- **Dashboard `icon` was dead.** `dashboardData` returned a per-resource `icon` neither DashboardPage twin rendered. Both twins now show it beside the label.
- **Docs and comment drift.** Removed the unimplemented `.searchable()` from the README headline example; documented `PUT` as a partial-update alias of `PATCH`; fixed stale comments that claimed Vue has no dialog host (it does, `AdminDialog.vue`) and that referenced a non-existent `./request.js` (it is `vike-crud/request`); noted the React-only widget shims for Vue consumers.
