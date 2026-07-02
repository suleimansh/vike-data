---
'vike-blocks': minor
---

vike-blocks: add the `table` block — a non-schema data table. Feed it rows + columns directly (API results, computed data) and it renders a themed table, sharing vike-view's ListView chrome (headers, cell padding, empty state, named formatters) without pulling in the schema path. The plain-data counterpart to the schema-driven `list`. Dep-free, theme-native, cross-framework (React + Vue).

```js
table({ columns: ['name', 'role', 'joined'], rows })
  .sortable()
  .empty('No members yet')
```

A column spec is a string (the row key; the label is humanized) or `{ key, label, align, format }`; `format` reuses ListView's named formatters (`since` -> relative time, booleans -> yes/no). With no `columns`, they are derived from the first row's keys. `.sortable()` makes every header a client-side sort toggle (local UI state, no actions layer). Display-only — the interactive non-schema form block waits on the actions axis (#385).
