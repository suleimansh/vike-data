---
'vike-blocks': minor
---

vike-blocks: add the `message-scroller` block (#445) — a dep-free, theme-native scroll container for a chat transcript, completing the chat cluster (bubble, message, message-scroller). `messageScroller([...messages]).height('20rem')`: a container that resolves its message list recursively and caps the scroll viewport (default 24rem). On mount the renderer sticks to the bottom (auto-scrolls to the latest); when the user scrolls up, a floating jump-to-latest button appears and returns them to the bottom (local UI state, so SSR renders the transcript with the button hidden and there's no hydration mismatch). The viewport + jump button styling lives in a shared `message-scroller-styles.js` module imported by both the React and Vue renderers, so the surface can't drift; every color reads a vike-themes CSS var.
