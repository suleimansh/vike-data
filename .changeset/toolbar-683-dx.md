---
'vike-toolbar': minor
'vike-themes': patch
'vike-i18n': patch
---

vike-toolbar: promote a shared `useToolbarSlot()` hook, warn on dropped items, and harden auto ids + docs (closes #683).

- **One leak-safe slot hook.** The resolve + observer + cleanup a provider-bound control uses to find the toolbar popover was hand-copied into vike-themes and vike-i18n (react + vue) as string literals. That copy is how #671's observer leak slipped in. It now has a single source, exported from `vike-toolbar/react/useToolbarSlot` and `vike-toolbar/vue/useToolbarSlot`, reading the canonical DOM ids from the core. vike-themes and vike-i18n re-export it instead of re-declaring it.
- **Dropped items are no longer silent.** `defineToolbarItems` drops entries missing `Control`; it now `console.warn`s (dev only) naming the item id, so a contributor sees why their control vanished.
- **Auto ids can't collide.** The fabricated fallback id for id-less items used the `item-N` shape, which could clash with an explicit `item-N` and produce duplicate React keys. It is now namespaced (`vike-toolbar-item-N`) and bumped defensively if an app uses that literal.
- **Vue binding is documented.** The README and the `index.js` / `+config.js` headers described only the React binding even though the Vue binding ships; both are now covered, and the item shape has a JSDoc `@typedef` for hover/IntelliSense.
