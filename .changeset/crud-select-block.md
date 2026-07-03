---
'vike-blocks': minor
'vike-crud': patch
---

vike-crud: render schema FK/enum fields through the theme-native `select` block.

The form widget for a foreign-key or enum column previously emitted a raw, unstyled `<select>`. It now renders vike-blocks' `select` block (SelectView), so schema forms and the admin get the same theme-native control (chevron, focus ring, radius reading `var(--radius)`) as a hand-authored `select`. Still a real `<select name>` = native POST, no client JS required.

- `vike-blocks`: the `select` block gains `.required()` (forces a real pick; the placeholder becomes a disabled prompt), and `SelectView` accepts `id` + `required` props. A non-required select keeps its placeholder option selectable, so an optional field can be cleared.
- `vike-crud`: the built-in `SelectField` (React + Vue) maps the resolved field onto `<SelectView>` — `required` fields force a pick, optional fields get a selectable `—` to clear the value. The `resolve.js` widget tokens are unchanged.
