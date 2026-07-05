---
'vike-blocks': minor
---

vike-blocks: add the `rating` block, a star-rating form control.

Hover to preview, click to set, arrow keys to adjust. `rating(label).value(v).max(5).allowHalf().readOnly().disabled().name('score')` — `.allowHalf()` enables half-star precision (each star's left half is x.5, its right half is x+1), `.readOnly()` renders a non-interactive display (a product average), and `.name()` adds a hidden input so the value posts with a native form. Each star is an outline with a colored fill layer clipped to its fraction, so half ratings show half-filled stars. The value is local UI state seeded from `.value()` (binding + submit is the actions axis #385), so the server and the first client render agree. The star row is a focusable `role="slider"` (arrow keys / Home / End) that also reads pointer position for mouse. The pointer-to-value and per-star fill math are pure, unit-tested helpers. Composes inside `field`. Dep-free, theme-native, React + Vue twins over one shared style module. Closes #625.
