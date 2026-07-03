---
'vike-blocks': patch
---

vike-blocks: refine the `select` + `combobox` controls (follow-up to #515).

- Both now use a proper stroked SVG chevron (lucide `chevron-down`) instead of a text glyph, so the arrow is crisp and aligned.
- `combobox` is now **input-anchored**: the trigger IS the search input (type in place to filter), and the list opens directly below it, instead of a button trigger with a separate search box inside the popover. Options are non-focusable `role="option"` rows so focus stays in the input while you arrow through them; picking one fills the field with the label. The placeholder switches to the search hint while open. A hidden input still carries the value.
