---
'vike-admin': minor
---

vike-admin: Vue dialog host for `mode: 'dialog'` (closes #598).

`mode: 'dialog'` (#596) shipped React-only; this adds the Vue side, so a dialog-mode resource now renders its view / create / edit as an overlay on the list on both renderers.

- New `vue/AdminDialog.vue` over vike-blocks' Vue `Overlay` (the same primitive the React host uses), rendering vike-crud/vue's `RecordView` and admin's `FormFields`.
- `vue/ListPage.vue` reads `mode` / `dialog` and, in dialog mode, points its links at `?view=@id` / `?edit=@id` / `?create` and mounts the dialog; route mode is unchanged.

No server change: `listData` already returns the framework-agnostic `mode` + hydrated `dialog` payload, and the dialog forms still POST to the existing `/new` and `/:id/edit` routes. The `examples/vue` admin flips its `sessions` resource to `mode: 'dialog'` (with `users` left route-mode) to show both presentations side by side.
