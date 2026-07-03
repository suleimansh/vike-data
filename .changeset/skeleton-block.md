---
'vike-blocks': minor
---

vike-blocks: add the `skeleton` block.

A pulsing placeholder shown while content loads, harvested from shadcn's skeleton and reimplemented dep-free — the pulse is pure CSS (no JS, no state, SSR-perfect) and stops under `prefers-reduced-motion`.

`skeleton()` is one bar; `.width()` / `.height()` size it (a number is px, a string like `'100%'` / `'1rem'` passes through), `.radius()` rounds it (`'full'` for a pill), `.circle(size)` is a round avatar placeholder, and `.lines(n)` renders a stack of text bars with the last one shorter. Compose several to mock a card / list / form loading state. Theme-native via a muted `color-mix`. React + Vue twins share one style module.
