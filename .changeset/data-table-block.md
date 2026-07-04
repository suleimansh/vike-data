---
'vike-blocks': minor
---

Add a `data-table` block: the plain `table` upgraded into a data table, with a global search filter, row selection (a checkbox column + select-all), and column-visibility controls.

```js
dataTable({ columns: ['name', 'role', { key: 'joined', format: 'since' }], rows })
  .sortable()          // client-side sort toggles on the headers
  .filter('Search...')  // a search box that filters across the columns
  .selectable()        // a checkbox column + select-all + a selected count
  .columnToggle()      // a "Columns" menu to show / hide columns
```

- Every feature is opt-in; filtering / sorting / selection / column-visibility are local UI state (selection binding is the actions axis, #385). The columns menu reuses the popover primitive.
- Same non-schema rows + columns API as `table` (string or `{ key, label, align, format }` columns), and it reuses the table chrome, so it themes identically. Stays the plain-data counterpart to vike-crud's schema-driven list.
- The shared column helpers (humanize + normalizeColumn) and a `rowMatchesQuery` filter moved to table-styles so `table` and `data-table` share one source (no behaviour change to `table`).
- React (`DataTableView`) + Vue (`DataTableView`) renderers.
