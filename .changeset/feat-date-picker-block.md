---
'vike-blocks': minor
---

Add the `date-picker` block: a `calendar` in a popover. Click the input-like trigger to open the month grid anchored below, pick a day to fill it and close. `datePicker(value).month().min().max().weekStartsOn().name().placeholder()`, React + Vue, dep-free and theme-native. Reuses the `calendar` renderer (via a new optional `onSelect` hook) and the popover primitive, so the grid math stays in one place.

Also ship the `usePopover` / `Popover` primitive (`vike-blocks/react/popover`, `vike-blocks/vue/popover`) — the light, non-modal sibling of the overlay primitive: a trigger-anchored panel that closes on outside-click or Escape, with no backdrop, scroll-lock, or focus trap. It's the shared machinery the upcoming dropdown-menu and nav-menu blocks reuse.
