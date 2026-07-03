---
'vike-blocks': minor
---

vike-blocks: add the `command` block (⌘K command palette).

A command palette harvested from shadcn's command (cmdk) and reimplemented dep-free on the shared Overlay primitive. A trigger button (a search-field affordance with a ⌘K hint) and a global ⌘K / Ctrl+K hotkey open a modal with a filter input over grouped items; arrow-keys move the active item and Enter runs it (navigating to its `to`). SSR renders only the trigger — the modal is client + open-gated — so there's no hydration mismatch.

```js
command()
  .placeholder('Search commands...')
  .group('Navigation').item('Dashboard', { to: '/', shortcut: '⌘H' }).item('Users', { to: '/admin/users' })
  .group('Actions').item('New post', { to: '/posts/new', shortcut: '⌘N' })
```

`.hotkey('k')` sets the open key, `.trigger()` the button label, `.empty()` the no-results text. The pure `filterCommands` (label filter + a flat list for keyboard nav) is unit-tested. React + Vue twins share one style module. Per-item actions beyond navigation are the actions axis (#385).
