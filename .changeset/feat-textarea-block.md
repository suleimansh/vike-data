---
'vike-blocks': minor
---

vike-blocks: add the `textarea` block (#433) — a from-scratch, theme-native multi-line text input leaf, the sibling of `input` (#427). `textarea().placeholder('Write a bio...').rows(5)`, with `.value(...)` (initial value), `.name(...)`, `.disabled()`, and `.required()`. Display + declared attributes only: value binding and submit are the data/actions axis (#385), so the renderer draws an uncontrolled textarea. Full-width, bordered, vertically resizable, with a `:focus-visible` ring, tinted `::placeholder`, and a dimmed disabled state; every color reads a vike-themes CSS var. The base style plus the states live in a shared `textarea-styles.js` module (base style + a static `TEXTAREA_STYLE_TAG`) imported by both the React and Vue renderers, so the surface can't drift. Composes inside the `field` block (#426) for its label / description shell.
