---
'vike-blocks': minor
---

vike-blocks: add the actions seam (#385) — `button` and `form` can carry a serializable action reference, and the renderers wire it to a runner supplied by vike-actions.

- `button('Publish').action('publish').params({ id: '$row.id' })` — a named action + params (plain data, no closures), distinct from the declarative `.to(path)` nav.
- `form(...).onSubmit('createMember')` — a named submit action, distinct from the native `.action(url)`; the native POST stays the no-JS fallback.
- A tiny `ActionContext` (`vike-blocks/react/action-context`, `vike-blocks/vue/action-context`) whose default is inert, so an action button/form with no provider stays passive. `vike-actions/{react,vue}` fills the seam via `<ActionRunnerProvider>` / `provideActionRunner`.

The context lives here so vike-blocks stays dep-free while a provider from vike-actions shares one context identity. No change to existing (no-action) buttons/forms.
