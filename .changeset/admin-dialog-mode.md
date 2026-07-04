---
'vike-admin': minor
---

vike-admin: `mode: 'dialog'` presentation for resources (closes #596).

A resource can now opt its view / create / edit screens into an overlay on the list route instead of navigating to a sub-page:

```js
defineResource({ table: 'tags', mode: 'dialog' }) // 'route' (each screen its own page) is the default
```

- **Per-resource, default `route`**: unset resources are unchanged (every screen stays its own `/admin/:table/...` page). `mode` mirrors vike-crud's `defineCrud({ mode })`, but admin defaults to `'route'` where a per-page vike-crud defaults to `'dialog'`. An invalid `mode` is a clear authoring error.
- **Shareable, refresh-safe**: a dialog is driven by a URL param on the list route (`/admin/:table?view=@id` / `?edit=@id` / `?create`). `listData` hydrates the active screen server-side, so a shared or refreshed URL reopens it.
- **No new write path**: the dialog's create / edit forms POST to the existing `/new` and `/:id/edit` routes, which insert / update and redirect back to the list (closing the dialog). Only the list route's read gains a dialog payload.
- **Reuse**: the overlay is a small `AdminDialog` over vike-blocks' `Overlay` (the same primitive vike-crud's `CrudDialog` wraps: portal + focus-trap + Escape + backdrop + scroll-lock), rendering admin's own `RecordView` / form.

React only for now (Vue has no dialog host upstream); on Vue a `mode: 'dialog'` resource falls back to route mode. A Vue host is a follow-up.
