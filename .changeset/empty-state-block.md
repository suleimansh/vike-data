---
'vike-blocks': minor
---

Add an `empty-state` block: the "no results / get started" surface that every table and list needs.

```js
emptyState('No posts yet')
  .description('Create your first post to get started.')
  .actions([button('New post').variant('primary')])
```

- An illustration medallion + title + description + an optional row of action blocks.
- Draws a built-in inbox icon, or pass any block to `.icon()` (an avatar, a custom illustration).
- Composes nested blocks (icon + actions resolved recursively like a card); static, theme-native, no client JS.
- React (`EmptyStateView`) + Vue (`EmptyStateView`) renderers.
