---
'vike-blocks': minor
---

vike-blocks: add the `switch` block (#432) — a dep-free, theme-native toggle control with an animated sliding thumb, completing the boolean/choice control set (checkbox, radio, switch). The builder is exported as `toggle` (`switch` is a reserved word) and the block type is `switch`: `toggle('Dark mode').checked().disabled()`, with an optional inline label and `.name(...)`. It renders as an accessible `<button role="switch">` that toggles its own visual state (local UI state); `checked` is the initial on-state so SSR and the first client render agree, and the thumb slides across the pill track as it flips (no motion library). Value binding and submit are the data/actions axis (#385). The track fill, the thumb slide, and the `:focus-visible` ring live in a shared `switch-styles.js` module imported by both the React and Vue renderers, so the surface can't drift. Every color reads a vike-themes CSS var; composes inside the `field` block (#426).
