---
'vike-blocks': minor
---

vike-blocks: add the `message` block (#444) — a chat message that composes the `bubble` block with its metadata (avatar, author, timestamp), for AI chat UIs. `message().from('user').author('You').at('9:41 AM').body('...')`: `.body()` folds into a nested `bubble` descriptor (a plain string or a rich body of nested blocks), `.from()` sets the sender for both the bubble color and the row alignment, and `.author()` / `.at()` add the name and timestamp shown above the bubble. The renderer draws an avatar (initials derived from the author, falling back by sender) on the sender's outer side, the author/timestamp header, and the composed bubble (resolved recursively). Layout + the avatar-initials helper live in a shared `message-styles.js` module imported by both the React and Vue renderers, so the surface can't drift; every color reads a vike-themes CSS var. Second of the chat cluster (bubble shipped; message-scroller to follow).
