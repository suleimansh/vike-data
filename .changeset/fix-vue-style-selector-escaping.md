---
'vike-blocks': patch
---

vike-blocks: fix quoted attribute selectors in six blocks that break under the Vue renderer.

Vue HTML-escapes the text inside a `<style>` element, so a double-quoted attribute selector like `[data-side="top"]` renders as `[data-side=&quot;top&quot;]`, which is invalid CSS and silently does nothing (React leaves `"` intact in text nodes, so it was unaffected). The `tooltip` (all `[data-side]` positioning, the hover/focus reveal, and the arrow), `button` (link-variant hover underline and the `aria-disabled` dim), `attachment` (hover border), `toggle` (hover background), `select` (muted placeholder), `slider` (disabled cursor), and `calendar` (day hover) blocks all used quoted selectors and were visibly broken in Vue. Switched them to unquoted selectors, which is valid CSS and a no-op for React.
