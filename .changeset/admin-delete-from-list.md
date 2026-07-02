---
'vike-crud': minor
'vike-admin': minor
---

vike-admin: Delete row action on the list (part of #503).

The admin list now shows a Delete control per row, next to Edit, so you can delete without opening the record first.

- `vike-crud`: `ListView` (React + Vue) gains an optional `rowActions(row)` slot that renders extra per-row controls in the actions column, alongside the existing `rowHref` edit link. The caller owns the markup, so it can be a no-JS form.
- `vike-admin`: the list fills that slot with a small `_action=delete` form posting to the row's edit route, reusing the existing owner-scoped delete (`data:editData`). No new endpoint and no wider write surface: server-side the delete keys on the primary key AND the resource scope, so a scoped user can only delete a row they own. Gated by `canEdit`, and confirmed client-side as progressive enhancement (submits normally with no JS).

Note: this covers the delete-from-list UX half of #503. The other half (wiring vike-actions' registry into the admin) is intentionally not done: the admin's resources and scopes resolve per-request from cumulative config, while vike-actions binds scope statically at registration, so bridging them would duplicate the admin's config-driven write path for no real gain.
