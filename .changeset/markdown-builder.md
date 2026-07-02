---
'vike-blocks': minor
---

vike-blocks: `markdown()` fluent builder + a real dep-free renderer for the markdown block.

- `markdown(source)` reads like the other leaves (`text()`, `heading()`, `code()`) instead of a raw `{ block: 'markdown', source }` descriptor. The block type stays `'markdown'` and raw descriptors still resolve (the builder is sugar).
- The built-in renderer now actually renders markdown: a small dep-free parser (headings, lists, bold / italic, inline + fenced code, links, blockquotes, hr) shared by the React and Vue renderers, building real elements (no `dangerouslySetInnerHTML`). It replaces the placeholder that dumped the raw source. It is a common subset, not a full engine, so for tables / GFM / footnotes swap in a real one with `registerBlockRenderer('markdown', ...)`.

```js
markdown('# Title\n\nSome **bold** and `code`, plus a [link](https://vike.dev).')
```
