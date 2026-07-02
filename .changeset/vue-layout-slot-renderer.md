---
'vike-blocks': minor
---

vike-blocks: Vue renderers for the `layout` and `slot` blocks (fast-follow to #504, part of #401).

The `layout` container and `slot` placeholder blocks now have Vue twins (`vue/LayoutView.js`, `vue/SlotView.js`), matching the React renderers: the same `stack` / `landing` / `centered` shells over an open `variant -> shell` map, and `slot(name).from('config')` filling from a cumulative chrome contribution — here via Vue `provide`/`inject` (`LayoutConfigProvider` / `useLayoutConfig`) instead of React context. New subpath exports `vike-blocks/vue/LayoutView` and `vike-blocks/vue/SlotView`. The core blocks were already framework-agnostic; this only adds the Vue binding.
