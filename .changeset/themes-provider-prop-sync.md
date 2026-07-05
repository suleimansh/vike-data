---
'vike-themes': patch
---

vike-themes: ThemeProvider now honors `theme`/`appearance` prop changes after mount.

Both the React and Vue providers seeded their state from props only once, so a page-level config override of either axis was ignored after a client-side navigation. They now sync to the incoming prop when it changes; a user's own selection still wins because it round-trips through the cookie as the next prop.
