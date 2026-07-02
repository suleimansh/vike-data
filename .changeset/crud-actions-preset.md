---
'vike-view': minor
---

vike-view: add the **`crudActions` preset** (#501, part of #385) — register owner-scoped create / update / delete actions for a table in one call, the write-side counterpart to `crudBlocks`.

```js
crudActions({ table: 'posts', tables, scope: (table, ctx) => ({ user_id: ctx.user.id }) })
// registers posts.create / posts.update / posts.delete; a table row action points at them:
//   button('Delete').action('posts.delete').params({ id: '$row.id' })
```

It wires each action to the same universal-orm repo (`buildDb`) and the same `scope` owner contract the views use, so a write is bounded to the caller's own rows AND ownership is re-forced onto the written row — a client can't reassign ownership or touch another owner's row. With `tables` (the merged schema) it knows the primary key and real columns, so it drops the pk, owner keys, and unknown keys from a client patch. Domain actions (e.g. `publish`) stay hand-written `defineAction`s; this is only the generic C/U/D.
