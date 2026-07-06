---
'vike-layouts': patch
---

vike-layouts: render the footer slot in the sidebar shells (closes #692).

The registry lists `footer` in the sidebar shell's slots and `defineLayout` resolves it, but neither the React nor Vue `SidebarShell` rendered a footer `SlotView` (only the topbar shells did). An app on `shell: 'sidebar'` with `footer: [...]` had it silently dropped. Both sidebar twins now render a footer band below the aside + main row, mirroring the topbar shells.
