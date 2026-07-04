---
'vike-blocks': minor
---

Add a `spinner` block: a dep-free, theme-native loading spinner for indeterminate waits, the companion to `skeleton` (a placeholder) and `progress` (a measured bar).

```js
spinner()                                   // a bare 20px spinner
spinner().size(32).label('Loading orders...')
spinner().tone('danger')
```

- Pure-CSS rotating arc (no JS, no state, SSR-perfect); the border thickness scales with the size and it slows (not stops) under `prefers-reduced-motion`.
- `role="status"` with the label as the accessible name (a visually-hidden "Loading" when there is none). Tones read `var(--color-*)`.
- React (`SpinnerView`) + Vue (`SpinnerView`) renderers over one shared style module.
