---
'vike-crud': patch
---

vike-crud: honor a touched query builder when a resource `query` fn forgets `return q`, instead of failing open to all rows (closes #691).

A resource read-scope written with a brace body and no return — `query: (q, ctx) => { q.where('user_id', ctx.user.id) }` — left `runQuery` with an `undefined` return, so it fell through to `{}` = unscoped and served every row, silently disabling row scoping from a one-character mistake. `runQuery` now honors the builder's filter whenever it was touched (`_filter` non-empty) but the fn returned nothing; only an explicit unrefined-`q` return or an untouched builder stays unscoped (the intentional admin bypass is unchanged).
