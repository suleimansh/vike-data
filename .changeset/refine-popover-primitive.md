---
'vike-blocks': minor
---

Refine the shared popover primitive (`usePopover`), improving date-picker, dropdown-menu, and nav-menu at once:

- **Edge-aware placement**: on open the panel measures the trigger + itself and flips `bottom`↔`top` (and `start`↔`end`) when it would overflow the viewport, instead of always opening on the requested side — so a menu near the bottom or right edge stays on-screen.
- **Max-height + scroll**: the panel is capped to the room in its chosen direction and scrolls if its content is taller, instead of running off-screen.
- **Motion**: the enter now adds a subtle scale-from-the-anchored-corner (not just opacity + slide), matching the shadcn/Radix feel.
- **Touch**: closes on `pointerdown` (mouse + touch), not just `mousedown`.

`panelStyle(visible)` now receives the resolved placement as a second argument, `panelStyle(visible, placement)`, so the enter motion matches the side the panel actually opened on.
