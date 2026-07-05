---
'vike-blocks': minor
---

vike-blocks: add a machine-readable block manifest for programmatic discovery.

New `describeBlock(type)` and `describeBlocks()` let tools and AI agents enumerate the catalog and learn how to compose each block without reading its source: for every registered type they report whether it is a pass-through or resolve-backed, its fluent builder surface (`methods` + `arity`), and any author-declared `params`. `defineBlock` now records the refine method names and builder arity automatically and accepts an optional `params` descriptor list. Additive and backward compatible.
