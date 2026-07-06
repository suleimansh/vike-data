---
'vike-layouts': minor
---

vike-layouts: remove the dead `toolbar` slot and resolve slots generically (closes #693).

The `toolbar` slot was declared in `+config.js`, `defineLayout`, and both ConfigLayouts, but no shell rendered it, so it resolved to `[]` end to end while the README claimed vike-toolbar populated it. vike-toolbar actually composes through its own `toolbarItems` seam + a global wrapper, independent of any layout slot, so the slot was a dead parallel path. It's now removed and the README corrected.

`defineLayout` now resolves ONE key per slot the chosen shell declares (built-in or custom) instead of a hardcoded list, and a new `shellSlotConfig()` helper reads those slots off a page's raw config. A custom shell registered via `registerShell` can declare its own slot and have it threaded end to end with no core change. See the new `examples/vike-layouts` app for a runnable walkthrough.
