# app-vike-blocks-vue

The Vue twin of `examples/vike-blocks` (which is React-only). A minimal `vike-vue` app that renders the vike-blocks catalog through `Page` from `vike-blocks/vue`, so the **Vue** block renderers can be exercised in a browser.

Trimmed to the interactive blocks whose Vue renderers have client behavior worth clicking:

- **/accordion** — height-morph expand/collapse; closed panels stay collapsed from first paint.
- **/dialog** — modal overlay (focus trap, Escape / backdrop / × close, scroll-lock); focus returns after the exit.
- **/dropdown** — anchored popover menu; edge-aware placement, outside-click / Escape close.

The block descriptors are the same framework-agnostic `definePage(...)` data the React gallery uses; only the renderer differs. No UI tier (themes/layouts/toolbar) — the blocks ship CSS-var fallbacks, so they render bare.

```bash
pnpm --filter app-vike-blocks-vue dev   # http://localhost:4301
```
