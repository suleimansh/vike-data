---
'vike-blocks': minor
---

Add the `dropdown` block: a dropdown menu — a trigger that opens a floating menu of items anchored below it. `dropdown(triggerLabel).item(label, { to, disabled }).separator().heading(text).align().side()`, React + Vue, dep-free and theme-native. An item is a link when `to` is set, else a button (the mutating behaviour is the actions axis #385). Reuses the `usePopover` primitive (anchor + outside-click + Escape + open-gated SSR) and adds roving arrow-key focus between items, so no new modal machinery is written.
