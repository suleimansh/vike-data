---
'vike-blocks': minor
---

vike-blocks: add the `item` block (#440) — a static, theme-native list-row primitive for lists, menus, and settings rows. `item('Billing').description('Manage your plan').media('💳').trailing('Pro')`: an optional leading media chip, a title, an optional muted description, and an optional muted trailing note pushed to the far end. Display-only — `media` and `trailing` are short text/emoji strings (rich block slots are the actions/menu axis, #385). Items compose inside any container (a `card`, `tabs`, etc.). The row layout (media chip, title/description column, trailing note) lives in a shared `item-styles.js` module imported by both the React and Vue renderers, so it can't drift; every color reads a vike-themes CSS var.
