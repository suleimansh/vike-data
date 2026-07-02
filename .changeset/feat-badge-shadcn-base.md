---
'vike-blocks': minor
---

vike-blocks: restyle the `badge` block to the shadcn Base badge surface (#446). `.variant()` now picks a shadcn Base surface (`default` / `secondary` / `destructive` / `outline`), theme-native via vike-themes CSS vars. The historical `.tone()` semantic intent (`muted` / `info` / `success` / `warning` / `danger`, plus `warn` / `error` / `note` aliases) is preserved for back-compat and rendered as a soft accent tint; `.variant()` wins when both are set, and a bare `badge('...')` is the neutral `secondary` surface. Per-variant/tone style data lives in a shared `badge-styles.js` module imported by both the React and Vue renderers so the surface can't drift between them.
