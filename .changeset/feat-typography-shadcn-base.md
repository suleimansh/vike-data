---
'vike-blocks': minor
---

vike-blocks: expand the text primitives to the shadcn Base typography set (#447). The `text` block gains a `.variant()` axis — `lead` (a larger, muted intro paragraph), `muted` (small secondary copy), `blockquote` (an italic, left-bordered quote), and inline `code` (monospace, tinted) — alongside the existing plain default, all theme-native via vike-themes CSS vars. The historical `.tone()` still tints the color and composes with a variant. A new `list` block renders an unordered (`<ul>`) or, with `.ordered()`, numbered (`<ol>`) list of strings on the shadcn list surface. Per-variant style data lives in a shared `typography-styles.js` module imported by both the React and Vue renderers so the surface can't drift, and the plain default keeps its exact previous rendering.
