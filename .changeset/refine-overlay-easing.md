---
'vike-blocks': patch
---

Refine the overlay blocks' motion (dialog / sheet / drawer) into one consistent easing system. The duration and easing curve now come from a single shared source (`overlay-motion.js`) that the overlay primitive, sheet, drawer, and dialog all read, so the four surfaces animate identically and can't drift. Everything settles on one decelerate curve (`cubic-bezier(0.32, 0.72, 0, 1)`, no overshoot) at a slightly snappier duration, the backdrop fade is matched, and the dialog's bouncy overshoot spring is replaced with a clean scale + fade (a modal shouldn't wobble). No API change.
