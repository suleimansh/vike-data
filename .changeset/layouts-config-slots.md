---
'vike-layouts': patch
---

vike-layouts: the `layout:` config now populates the `footer`, `userMenu` and `toolbar` slots.

`defineLayout` already resolved these slots and the app shells rendered them, but they could never be filled through the config seam: `+config.js` did not declare the keys (so Vike never collected them) and `ConfigLayout` did not forward them. Both are fixed in the React and Vue bindings; `footer` and `toolbar` are cumulative (extensions can contribute), `userMenu` is a single selection.
