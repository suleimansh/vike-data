---
'vike-blocks': patch
---

vike-blocks: twin-parity, dedup, and a11y fixes for the recently added blocks.

- context-menu: the Vue renderer wrapped the block in a `<span>` (React used a `<div>`), which nested a block-level trigger `<div>` inside an inline element. Both now emit a `<div>`.
- tree-view: React mapped `node.children` unguarded where Vue used `node.children ?? []`; aligned the twins. Its `samePath` helper was a byte-for-byte copy of doc-nav's, so both now re-export a single `samePath` from the shared helpers module.
- stepper: each step `<button>` carried `role="listitem"` (overriding the button role) and the content panel was an orphan `role="tabpanel"`. The header is now a labeled `role="group"`, the steps are plain buttons, and the panel drops the tabpanel role. `aria-current="step"` is unchanged.
- rating: the interactive `role="slider"` now sets `aria-valuetext` ("3.5 out of 5") so half values are announced with context, matching the read-only twin.
