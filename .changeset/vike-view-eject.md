---
'vike-view': minor
---

vike-view: add `ejectView(view)` — customization tier 3, the eject escape hatch. When you outgrow config (tier 1) and slot overrides (tier 2), eject hands you the whole generated page as plain, owned source and steps out of the way: no more shared `ViewPage` / `viewData` / `views` config dispatch. It writes a self-contained page folder — a `+data.js` (the view descriptor inlined, the read + owner-scoped write path, and the request reader all local) and a `+Page.jsx` (React) or `+Page.vue` (Vue).

```js
import { ejectView } from 'vike-view/eject'

const { files } = ejectView(view, { framework: 'react' }) // or 'vue'
// -> [{ path: 'pages/posts/+data.js', source }, { path: 'pages/posts/+Page.jsx', source }]
for (const f of files) await writeFile(f.path, f.source)
```

It leans on two guarantees of the block IR: a view's `sections` are serializable block descriptors (emitted as an editable literal) and its `scope` is a real function (emitted verbatim via `Function.prototype.toString()`, so you get your exact owner predicate back, not a stub). Pure codegen — a CLI or the vike-toolbar writes the files. `examples/vike-view` ships a committed ejected page (`pages/posts-ejected/`), runtime-verified: same list + create form as the generated `/posts`, owner-scoped writes, nothing regenerating.
