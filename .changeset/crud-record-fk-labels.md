---
'vike-crud': patch
---

vike-crud: resolve FK labels for the record block so record views show the referenced title (closes #675).

`RecordView` read a FK cell's label from `row[`${name}_label`]`, but nothing ever set that key: `hydrateRecord` computed no FK labels (only the list block did, and as a separate `fkLabels` map), and `projectRow` would have stripped a `*_label` key anyway — so a record view always rendered the raw FK key despite the "FK-aware cells" promise. `hydrateRecord` now computes an `fkLabels` map (the same shape the list block uses), and both RecordView twins read the referenced title from it.
