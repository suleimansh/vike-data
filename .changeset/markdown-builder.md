---
'vike-blocks': minor
---

vike-blocks: add a `markdown()` fluent builder so the markdown block reads like the other leaves (`text()`, `heading()`, `code()`) instead of a raw `{ block: 'markdown', source }` descriptor.

```js
markdown('# Title\n\nSome **bold** copy.')
```

The block type stays `'markdown'` and raw descriptors still resolve (the builder is sugar, not required). The built-in renderer is unchanged (an MVP `<pre>`; swap in a real one with `registerBlockRenderer('markdown', ...)`).
