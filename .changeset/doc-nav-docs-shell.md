---
'vike-blocks': minor
---

Add a `docNav` block and a `docs` layout shell — the two vike-blocks pieces of DocPress-on-the-IR (#420).

```js
docNav()
  .current('/guide/setup')
  .group('Getting started', [
    ['Introduction', '/guide/intro'],
    ['Setup', '/guide/setup', [['Requirements', '#requirements'], ['Config file', '#config']]],
  ])
  .group('API', [['CLI', '/api/cli']])
```

- `docNav` is a documentation sidebar tree: collapsible categories, page links, active + relevant state, and an on-page section splice under the active page. The category holding the current page starts open (seeded from resolve, so there is no hydration flash); the rest start collapsed. Navigation is a real `<a>`, so it works with no client JS.
- `groupLeveledItems(leveled)` adapts a flat, leveled nav list (a doc framework's `level: 1` category / `2` page / `3` section shape) into `docNav` groups, so `docNav().tree(groupLeveledItems(navItems))` drives the sidebar with no per-item rewrite.
- The `layout` block gains a `docs` variant: a sticky navbar row over a two-column `[sidebar | article]` grid, responsive (the sidebar collapses on narrow screens for a header-hosted mobile menu). Register/override shells with `registerLayoutShell` as before.
- React (`DocNavView`) + Vue (`DocNavView`) renderers over one shared style module.
