---
'vike-blocks': minor
---

vike-blocks: add the `description-list` block, a key-value metadata grid.

The record-detail / summary / metadata surface (Ant Descriptions), pairs with the vike-crud record view. `descriptionList().item(term, value, { span }).columns(n).bordered().title(t)` — a responsive grid of term/value pairs in semantic `<dl>` markup. A value is a plain string OR nested blocks (resolved recursively), so it can be a status badge, a link, or any composition; a per-item `span` lets one pair take several columns; `.bordered()` draws the table-like variant. It collapses to a single column on narrow screens. Static (no client state), so it renders fully on the server with no hydration concern. Dep-free, theme-native, React + Vue twins over one shared style module. Closes #623.
