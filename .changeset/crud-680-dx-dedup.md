---
'vike-crud': patch
---

vike-crud: warn on typo'd column names, unify the boolean label, and dedup the builder-collapse (part of #680).

- **Typo'd column names now warn.** A `list`/`record`/`form` spec that names a column not in the schema (and has no `.slot()` to render it) used to silently fall back to `type:'string'` and render an always-empty column. `viewColumns` / `viewRecord` / `viewFields` now `console.warn` naming the missing column and its table, the same way the table name is already validated loudly. A slot-only custom column (a `display()`/`column()` with no schema backing) is intentional and stays exempt.
- **Boolean cells read one way.** The list cell rendered lowercase `yes`/`no` while the record field rendered `Yes`/`No`. Both now go through a shared `booleanLabel` helper (exported from `list-format.js`) that reads `Yes`/`No`, so the two renderers can't drift.
- **Builder-collapse deduped.** `crudBlocks()` re-implemented the column/display/field builder-to-plain-spec collapse inline; it now reuses the exported `plainSpecs` from `define.js`.
