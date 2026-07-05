---
'vike-blocks': minor
---

vike-blocks: ship TypeScript declarations for the core (`index.d.ts`).

The package now exposes a `types` entry so editors and AI agents get autocomplete and inference over the seams that matter most: `definePage`/`resolvePage`, the registry, `describeBlock`/`describeBlocks`, `defineBlock`, and the `Block`/`Section`/`Builder`/`BlockManifest` shapes. Every built-in builder is declared with a chainable `Builder` return; a block's per-instance refinements and params remain discoverable at runtime via `describeBlock()`.
