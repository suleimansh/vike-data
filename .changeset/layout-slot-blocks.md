---
'vike-blocks': minor
---

vike-blocks: add the `layout` container block and the `slot` placeholder block (spike for #401 — collapse layouts into the block IR).

A layout is not a separate system: it is the same container pattern as `tabs`/`card` — a block whose named regions hold nested block compositions, resolved recursively and kept serializable. A `variant` picks a swappable shell implementation (`landing` / `centered` / `stack`), drawn by the per-framework renderer registered for `layout`.

```js
layout('landing')
  .slot('header', [ slot('nav').from('config'), button('Sign in') ])
  .slot('main',   [ heading('Ship faster').level(1), text('...') ])
  .slot('footer', [ text('(c) Acme') ])
```

`slot` is a first-class placeholder whose `from` names its fill source, so app CHROME and page CONTENT share one model without collapsing into each other:

- `from: 'children'` (default) draws the inline blocks passed to it (page content).
- `from: 'config'` draws a cumulative config contribution read at render time (nav / toolbar) — the vike-layouts chrome seam expressed as a block, so an extension still contributes a nav item without editing every page.

React renderers only in this spike (Vue is a fast-follow); the core `layout`/`slot` blocks are framework-agnostic. No change to existing blocks.
