---
'vike-blocks': minor
---

vike-blocks: add the `bubble` block (#443) — a single chat message bubble for AI chat UIs, from-scratch + theme-native. `bubble('How do I migrate?').from('user')` renders a right-aligned, primary-colored bubble; `.from('assistant')` (the default) renders a left-aligned, surface-colored one, each with a squared-off tail corner on the sender's side. A bubble holds a plain string, or a rich body of nested blocks (`bubble([markdown('...')])`) resolved recursively like a card. An unknown sender falls back to the assistant. Alignment + colors live in a shared `bubble-styles.js` module imported by both the React and Vue renderers, so the surface can't drift; every color reads a vike-themes CSS var. First of the chat cluster (message, message-scroller to follow).
