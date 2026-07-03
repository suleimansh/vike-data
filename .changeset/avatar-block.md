---
'vike-blocks': minor
---

vike-blocks: add the `avatar` + `avatarGroup` blocks.

A user image with an initials fallback, harvested from shadcn's Radix avatar and reimplemented dep-free. `avatar().src('/me.png').name('Ada Lovelace')` shows the image, falling back to the derived initials (then a user icon) when there's no image or it fails to load — the image hides itself on a load error (the only JS, an inline `onError`), so there's no state and SSR renders the final markup.

- `.size(px)` / `.shape('circle' | 'square')` / `.status('online' | 'busy' | 'away' | 'offline')` (a ringed presence dot). Initials are derived from the name (first + last initial, or the first letter of a mononym) and unit-tested.
- `avatarGroup([...]).max(n)` stacks avatars with an overlap + separating ring, collapsing the rest into a "+N" count chip.

Theme-native via `var(--color-*)`. React + Vue twins share one style module.
