---
'vike-blocks': minor
'vike-admin': patch
---

vike-blocks: add the `confirm` block (alert dialog), and use it for the admin's Delete.

A new catalog block that guards a destructive action, harvested from shadcn's AlertDialog. Unlike `dialog` (a free-form modal that holds nested blocks), a `confirm` is a fixed shape (title + description + Cancel / Confirm) and is a themed replacement for `window.confirm`.

- `vike-blocks`: `confirm('Delete').danger().title(...).description(...).confirmLabel('Delete').action('/posts/42').field('_action', 'delete')`. In `action` mode it owns a real `<form>`, so it works with **no client JS** (the trigger submits directly); once hydrated the submit is intercepted and gated behind the dialog. It can also navigate on confirm (`.to()`) or just close. `.link()` renders a compact text trigger for table rows. React + Vue twins on the shared Overlay primitive; the buttons reuse the button block's styles. Value-mutation stays the actions axis (#385).
- `vike-admin`: the per-row Delete control now uses the `confirm` block instead of a raw `<form>` + `window.confirm`. Same owner-scoped `_action=delete` POST and the same no-JS behavior, now with a theme-native confirmation dialog after hydration.
