# blocks/

The built-in block catalog, framework-agnostic. Each block is one or two files:

- `<name>.js` — the fluent authoring builder plus its `registerBlock` resolve. This is
  the only half a consumer of `vike-blocks` (the barrel) needs.
- `<name>-styles.js` (optional) — shared, framework-agnostic style / geometry data
  imported by BOTH `../react/<Name>View` and `../vue/<Name>View`, so the two renderers
  can't drift. Colors and radius are always vike-themes CSS vars with a fallback
  (`var(--color-primary, #2563eb)`), never hardcoded, so a block reads on any theme.

Leaf blocks (`kbd`, `badge`) are a single builder file. Blocks with hover / focus states,
per-variant surfaces, or layout math keep that data in the `-styles.js` twin. The DOM half
(state, portals, transitions) lives in the per-framework renderer, never here.

## Adding a block

1. `blocks/<name>.js` — a `defineBlock('<name>', { build, refine })` builder, or a
   hand-written accumulating builder + `registerBlock` for containers that hold nested
   block arrays (see `card.js`, `tabs.js`).
2. `blocks/<name>-styles.js` — only if react + vue would otherwise duplicate style data.
3. `react/<Name>View.jsx` + `vue/<Name>View.js` — the renderers, each calling
   `registerBlockRenderer('<name>', View)`.
4. Wire the four barrels: side-effect import + named export in `../index.js`,
   `../react/index.js`, `../vue/index.js`, and (only if the block warrants a direct
   subpath) `../package.json` `exports`.
5. `test/<name>.test.js` — cover the builder + resolve. Renderers are DOM-only and are
   verified live, not in `node --test`.

Theme-native, cross-framework, dep-free. A third-party block ships the same way from its
own package via `defineBlock` + `registerBlockRenderer` and is a peer, not a special case.
