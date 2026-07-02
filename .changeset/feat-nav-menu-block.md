---
'vike-blocks': minor
---

Add the `nav-menu` block: a navigation menu — a horizontal bar of top-level links and dropdown sections. `navMenu().link(label, to).group(label, [links]).link(...)`, React + Vue, dep-free and theme-native. A group's trigger opens a dropdown of links (each a title + optional description) anchored below it, one section open at a time. Reuses the `usePopover` primitive and the dropdown's roving arrow-key navigation, so no new interaction machinery is written; navigation is a real `<a>` and mutating behaviour is the actions axis (#385).
