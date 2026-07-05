---
'vike-crud': minor
---

vike-crud: describe the schema-derived list/record/form blocks in the block catalog, and re-export the catalog API (closes #670).

The `list`/`record`/`form` blocks now declare `category`/`summary`/`params`/`example` discovery metadata, so `describeBlock('list')` (and `blockCatalog()`) tells an agent they are schema-derived and need a `table` prop instead of reporting them as opaque pass-throughs. `describeBlock`, `describeBlocks`, `blockCatalog`, and `CATALOG_CONTRACT_VERSION` are now re-exported from `vike-crud`, so the catalog is enumerable through the umbrella without reaching into vike-blocks internals.
