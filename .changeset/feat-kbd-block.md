---
'vike-blocks': minor
---

vike-blocks: add the `kbd` block (#441) — a static, theme-native keyboard-key leaf for documenting shortcuts. `kbd('Esc')` renders a single cap; `kbd(['Cmd', 'K'])` renders a combo (each key its own `<kbd>` cap). A single string is normalized to a one-key array. The cap styling (a small monospace, bordered cap with a subtle bottom-edge shadow) lives in a shared `kbd-styles.js` module imported by both the React and Vue renderers, so it can't drift; every color reads a vike-themes CSS var.
