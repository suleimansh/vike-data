---
'vike-blocks': minor
---

vike-blocks: add the `tree-view` block, an arbitrary-depth nested hierarchy.

The file-explorer / folder-tree / org-chart / nested-settings surface. A from-scratch, dep-free block that generalizes `doc-nav` (fixed at category -> page -> section) to any depth: `tree().node(label, { open, href, icon, badge }, children)`, children recurse; `.current(path)` highlights the matching leaf and auto-opens the branch that holds it. Branches toggle on click / Enter; roving arrow-key focus (Up/Down/Home/End move, Right/Left expand/collapse) over ARIA `tree`/`treeitem`/`group`. A leaf with an `href` is a real `<a>`, so a static tree navigates with no client JS. Open state is seeded from each node's resolved flag, so the server and the first client render agree (no hydration flash). React + Vue twins share one style module. Closes #617.
