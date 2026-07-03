---
'vike-blocks': minor
'vike-admin': patch
---

vike-blocks: add the `breadcrumb` block, and use it for the admin's edit-page trail.

The trail of pages to the current one, harvested from shadcn's breadcrumb and reimplemented dep-free. Built with a fluent accumulating builder: `breadcrumb().crumb('Home', '/').crumb('Posts', '/posts').crumb('Edit')` — every crumb with a `to` is a link, and the last crumb is always the current page (foreground, `aria-current`, no link), separated by a chevron (or a custom `.separator()`). Plain `<a>` links + no state, so it works with no client JS and SSR-renders as-is. React + Vue twins share one style module.

- `vike-admin`: the edit page's single back-link is replaced with a full `Admin › <table> › Edit <record>` breadcrumb, so you can hop back to either the list or the admin root (the back-link only offered the list).
