---
'vike-blocks': minor
---

vike-blocks: add the `tooltip` block.

A small label revealed on hover / keyboard focus, harvested from shadcn's Radix tooltip but reimplemented dep-free and **pure-CSS** — no portal, no client JS, no local state, so it works with no JS and SSR-renders as-is (no hydration concern).

`tooltip('Save your changes').on(button('Save'))` wraps any block via `.on()` (button, badge, link, ...) — or omit it for a default focusable "?" info marker. `.side('top' | 'bottom' | 'left' | 'right')` places the tip. The tip is a `position:absolute` child of a `position:relative` wrapper, revealed via `:hover` / `:focus-within` with a fade + scale and a rotated-square arrow; the dark surface reads `var(--color-*)`. React + Vue twins share one style module.
