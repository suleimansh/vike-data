---
'vike-blocks': patch
---

vike-blocks: the Vue `rating` block now reacts to `max`/`allowHalf`/`readOnly`/`disabled` prop changes.

These were read once in `setup()`, so a re-render with new props kept a stale star count, aria values and handler behavior. They are now read fresh on each render and in the handlers, matching the React twin. `value` remains the initial rating.
