---
'vike-blocks': minor
---

Add a `collapsible` block: a single expand/collapse disclosure (shadcn Collapsible), the single-panel sibling of `accordion`.

```js
collapsible('Details', [text('The fine print.')])              // starts closed
collapsible('Advanced', [field('Key').control(input())]).open()   // starts open
```

- One trigger toggles one panel of nested blocks (resolved recursively, so collapsibles compose). Open/closed is local UI state.
- Reuses the accordion's dep-free height morph + fade (the panel measures its natural height and CSS-transitions between 0 and it); no motion library. The Vue twin seeds a closed panel to 0 so it never flashes open then snaps shut.
- React (`CollapsibleView`) + Vue (`CollapsibleView`) renderers.
