---
'vike-blocks': minor
---

vike-blocks: add the `sheet` block (#424) and factor a shared overlay primitive. `sheet().trigger('Filters').side('right').title(...).sections([...])` is a side panel overlay anchored to a screen edge (right / left / top / bottom, default right) that slides in from that edge and holds a nested composition of blocks, with `.description()` and `.defaultOpen()`.

Under the hood, the portal + backdrop + focus trap + Escape + outside-click + body scroll-lock + the enter/exit lifecycle are now a single shared overlay primitive (`react/overlay.jsx` + `vue/overlay.js`, exported as `Overlay` / `useOverlay`), written and hardened once. `dialog` is refactored onto it with no change to its API or behavior, and `sheet` is the second consumer: a modal surface now supplies only its backdrop alignment and its enter transform (centered flip for a dialog, edge slide for a sheet), so the shared machinery can't drift between them. This is the foundation the remaining overlay/menu blocks (drawer, dropdown-menu, nav-menu, date-picker) build on. The sheet's per-side geometry lives in a shared `sheet-styles.js` module imported by both renderers; every color reads a vike-themes CSS var.
