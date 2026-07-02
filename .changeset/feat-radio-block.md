---
'vike-blocks': minor
---

vike-blocks: add the `radio` block (#431) — a dep-free, theme-native radio group with an animated selection, a reimplementation of the animate-ui Base radio. Built with a fluent accumulating builder: `radioGroup().option('free', 'Free').option('pro', 'Pro').value('pro')`, with `.name(...)` and `.disabled()`. Each option renders as an accessible `<button role="radio">` inside a `role="radiogroup"`; picking one updates the local selection and the inner dot springs in (scale + fade, no motion library). `value` is the initial selection (defaulting to the first option), so SSR and the first client render agree, and selection + submit is the data/actions axis (#385). The circle, the dot spring, and the `:focus-visible` ring live in a shared `radio-styles.js` module imported by both the React and Vue renderers, so the surface can't drift. Every color reads a vike-themes CSS var; composes inside the `field` block (#426).
