---
'vike-blocks': patch
---

vike-blocks: fix interactive keyboard a11y in tree-view and context-menu.

- tree-view: the roving tab stop was managed by mutating `tabIndex` on DOM nodes, so collapsing a branch that held the focused row left the tree with no tab stop (a keyboard user who tabbed away could not tab back in). The single tab stop is now root state that each row reads and syncs on focus, so it always tracks a mounted, visible row. Also completes the WAI-ARIA tree keys: ArrowRight on an expanded branch moves into the first child, and ArrowLeft on a leaf or collapsed branch moves out to the parent (ArrowRight/Left still open/collapse a branch first).
- context-menu: right-clicking again while the menu was open overwrote the saved opener with a menu item that unmounts on close, so focus was dropped instead of restored; the opener is now captured only on a fresh open. An empty or all-disabled menu now focuses the menu panel itself (it is `tabindex="-1"`) so Escape closes it and screen readers announce it, instead of leaving focus behind.

Applied identically to the React and Vue renderers; SSR output is unchanged (the tab stop starts on the first node, matching the server render).
