---
'vike-blocks': minor
---

vike-blocks: add the `checkbox` block (#430) — a dep-free, theme-native boolean control with an animated check, a reimplementation of the animate-ui Base checkbox. `checkbox('Accept the terms').checked().disabled()`, with an optional inline label and `.name(...)`. It renders as an accessible `<button role="checkbox">` that toggles its own visual state (local UI state, like the tabs/accordion blocks); `checked` is the initial state so SSR and the first client render agree, and the check springs in on toggle (scale + fade, no motion library). Value binding and submit are the data/actions axis (#385). The box fill, the check spring, and the `:focus-visible` ring live in a shared `checkbox-styles.js` module imported by both the React and Vue renderers, so the surface can't drift. Every color reads a vike-themes CSS var; composes inside the `field` block (#426).
