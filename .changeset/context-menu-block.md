---
'vike-blocks': minor
---

vike-blocks: add the `context-menu` block (right-click, cursor-anchored), and fix a Vue-only dropdown style bug.

The last member of the menu family (dropdown / nav-menu / command). `contextMenu().item(label, { to, disabled }).separator().heading(text).on(block)` — `.on()` wraps the right-click region (tooltip convention); omit it for a default affordance box. Unlike `dropdown` (a menu anchored below a trigger) and the modal overlays, a context menu is non-modal and cursor-positioned: it portals to `<body>`, opens at the pointer, and flips at the viewport edge (unit-tested `clampMenuPosition`). It reuses the dropdown menu chrome (item / separator / heading rows + roving arrow-key focus) and the popover surface box. Closes on outside pointer-down / Escape / scroll / resize / pick. SSR renders only the trigger (the menu is client + open-gated), so there is no hydration mismatch. React + Vue twins. Closes #619.

Also fixes a latent Vue bug in the shared `dropdown` style: its disabled-item hover rule used a double-quoted attribute selector (`[aria-disabled="true"]`), which Vue HTML-escapes inside a `<style>` element (`=&quot;true&quot;`), silently breaking the rule in Vue. Switched to the unquoted, escape-safe `[aria-disabled=true]`, so disabled dropdown/context-menu items no longer take the hover background under Vue.
