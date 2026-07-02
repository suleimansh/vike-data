---
'vike-blocks': minor
---

vike-blocks: add the `input` block (#427) — a from-scratch, theme-native single-line text input leaf, the first form primitive. `input().type('email').placeholder('you@example.com')`, with `.value(...)` (initial value), `.name(...)`, `.disabled()`, and `.required()`. Display + declared attributes only: value binding and submit are the data/actions axis (#385), so the renderer draws an uncontrolled input. The base style plus the `:focus-visible` ring, `::placeholder` tint, and disabled state live in a shared `input-styles.js` module (base style + a static `INPUT_STYLE_TAG`) imported by both the React and Vue renderers, so the surface can't drift. Every color reads a vike-themes CSS var. Pairs with the coming `field` block (#426) for its label / description / error shell.
