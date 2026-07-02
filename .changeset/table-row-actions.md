---
'vike-blocks': minor
---

vike-blocks: the `table` block gains a **row-action column** (#493, part of #385). `.rowActions([...])` takes action-button blocks whose `params` tokens resolve against each row, so one descriptor drives a per-row button:

```js
table({ columns: ['title', 'status'], rows })
  .rowActions([
    button('Publish').variant('default').size('sm').action('publish').params({ id: '$row.id' }),
    button('Delete').variant('destructive').size('sm').action('delete-post').params({ id: '$row.id' }),
  ])
```

The renderer (React + Vue) draws a trailing actions column and resolves each button's `$row.<col>` params against that row; the button then runs through the vike-actions runner like any action block.

Also moves the param-token resolver here — `resolveParams` / `resolveToken` are now exported from `vike-blocks` (params ride on block descriptors, so the renderers and the vike-actions client runner share one resolver). `vike-actions` re-exports them, so `import { resolveParams } from 'vike-actions'` is unchanged.
