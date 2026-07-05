---
'vike-blocks': minor
---

vike-blocks: add `blockCatalog()` — the versioned agent contract for composing pages from blocks.

`blockCatalog()` returns `{ contractVersion, blocks }`, a JSON-serializable snapshot an AI agent or MCP tool consumes to build a page without importing vike-blocks internals. The per-block descriptor (`describeBlock`) now also carries `category`, `summary`, `container` and a copy-pasteable `example`, and `params` gains optional `type`/`enum`. All fields are optional metadata a block declares via `defineBlock`/`registerBlock`; a first tranche of common blocks (content primitives, form controls, card/dialog/form/field, alert, table, stat) is documented, with the rest to follow. `CATALOG_CONTRACT_VERSION` is exported so consumers can guard on the shape. Fully additive and backward compatible.
