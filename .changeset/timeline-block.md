---
'vike-blocks': minor
---

Add a `timeline` block: a dep-free, theme-native vertical activity feed (Ant Timeline), the audit-log / order-status / changelog surface.

```js
timeline()
  .item('Order placed', { time: '09:41', tone: 'success' })
  .item('Shipped', { time: 'Mar 3', body: 'Carrier: UPS' })
  .item('Out for delivery', { tone: 'muted', filled: false, body: [text('ETA 5pm')] })
```

- A rail of tone-colored dots joined by connectors; each event has a title, an optional time, and a body that is a string or nested blocks (resolved recursively). `filled: false` draws a hollow ring for an upcoming step.
- No JS, no state; SSR renders the final markup. Dot tones read `var(--color-*)`.
- React (`TimelineView`) + Vue (`TimelineView`) renderers over one shared style module.
