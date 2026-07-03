---
'vike-blocks': minor
'vike-admin': patch
---

vike-blocks: add the `pagination` block, and use it for the admin's list pager.

Page navigation for a list/table, harvested from shadcn's Pagination (nav > ul > li > a: the active page outlined + aria-current, chevron Prev/Next, an ellipsis for gaps). shadcn leaves the page-range math to the consumer; this block owns it.

- `vike-blocks`: `pagination(page, pageCount).href('/posts?page={page}').siblings(1)`. The renderer computes which page numbers to show (a pure, unit-tested `paginationRange`) and draws real `<a href>` links built from the `{page}` template, so paging works with **no client JS** (native navigation, no local state). The links reuse the button block's styles. A hand-rendered app can pass an `href(page)` function to `PaginationView` directly. React + Vue twins.
- `vike-admin`: the list pager was a bare Prev/Next pair; it now uses the `pagination` block, so the admin gets numbered pages + ellipsis while keeping the same query-string links (`?page=&sort=&dir=`) and no-JS navigation.
