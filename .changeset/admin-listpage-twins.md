---
'vike-admin': patch
---

vike-admin: align the React/Vue ListPage twins (closes #674).

- React route-mode `viewHref`/`editHref`/`deleteAction` now `encodeURIComponent` the row id, matching the Vue twin and this file's own dialog-mode hrefs. A primary key containing a space / `/` / `#` / unicode previously produced a broken Edit/View/Delete link on React only.
- Vue list wrapper drops the dead `overflowX: 'auto'` that the `overflow: 'hidden'` shorthand overrode, so both twins render the same wrapper.
