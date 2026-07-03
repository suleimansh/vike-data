---
'vike-blocks': minor
---

vike-blocks: add the `select` and `combobox` form controls (#515).

Two missing single-choice controls in the block catalog. A hand-authored `form([...])` previously had input/textarea/checkbox/radio/switch/slider but no way to pick from a list.

- `select` — a theme-native styled control over a native `<select>` (harvest: shadcn Base native-select), with the browser chevron replaced by ours. `select().option(value, label, { disabled }).value().placeholder().name().disabled()`. Dep-free, SSR-safe; unlike radio it does not force the first option, so a `placeholder` can start empty.
- `combobox` — a searchable single-select (harvest: shadcn combobox = popover + search input + listbox) on the shared `usePopover` primitive. Filters as you type, arrow-key + Enter to pick, empty state, outside-click / Escape close. A hidden input carries the value for a plain form POST. `combobox().option().value().placeholder().searchPlaceholder().empty().name().disabled()`.

React + Vue twins share one style module per block, so the surfaces can't drift. Value binding / submit stays the actions axis (#385). Live demos added under `examples/vike-blocks` (`/select`, `/combobox`).
