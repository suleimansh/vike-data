---
'vike-blocks': minor
---

vike-blocks: add the `progress` block.

A determinate (or indeterminate) progress bar, harvested from shadcn's Radix progress and reimplemented dep-free — the determinate fill is a pure-CSS width transition and the indeterminate mode is a keyframed sliding segment (no JS, no state, SSR-perfect), slowed under `prefers-reduced-motion`.

`progress(66)` fills to 66%; `progress().value(3).max(5)` uses a custom scale; `.indeterminate()` animates an unknown-duration bar; `.label('Uploading')` adds a caption row (label + value%); `.size(px)` sets the bar height. Theme-native (the fill reads `--color-primary`); a `role="progressbar"` with `aria-valuenow`/`min`/`max`. React + Vue twins share one style module.
