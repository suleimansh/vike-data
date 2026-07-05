# vike-blocks × Mantine

The swappable-renderer proof: **one block IR, swap the drawer**. vike-blocks ships its own
shadcn-style React renderers. This app registers **Mantine** components against the same block
descriptors, so the identical `definePage([...])` tree draws as a whole different component library.

It's the sibling of the DocPress shell proof:

| Angle | Example | What swaps |
|---|---|---|
| Restructure a shell | `examples/docpress-themes` (adapter) | a doc site's page shell, expressed on the block IR |
| Swap the component kit | **this app** | the whole third-party library — Mantine draws the blocks |

## How it works

Two seams, both already built into vike-blocks — see `mantine-blocks.jsx`:

- `registerBlockRenderer(type, Component)` — the React half of the block registry. A later call wins,
  so registering a Mantine component for `button` overrides the built-in for the whole app.
- `registerLayoutShell(variant, Component)` — the `layout` block's shell registry. A Mantine `docs`
  shell replaces the built-in two-column documentation frame.

```js
registerBlockRenderer('button', MantineButton)   // + card, tabs, alert, dialog, input
registerLayoutShell('docs', MantineDocsShell)
```

We swap **6 content tokens + the docs shell**, not the whole ~56-block catalog. Every other block
(`text`, `heading`, `badge`, `link`, `docNav`, …) falls through to its built-in renderer — so a
Mantine card holds a built-in heading with zero extra work. That fall-through is the proof the
registry composes: swap the tokens you care about, inherit the rest.

The descriptor trees in `shared-page.js` are plain vike-blocks — the same authoring API the
`examples/vike-blocks` gallery pages use. Nothing about them is Mantine; what draws them is decided
entirely by which renderers are registered.

## Pages

- `/` — a same-viewport **parity strip** (button / alert / input drawn from the identical resolved
  descriptor, built-in on the left, Mantine on the right) above the full `contentPage` tree drawn
  entirely in Mantine.
- `/docs` + `/docs/:slug` — a small **multi-page docs site** on the `layout('docs')` shell, drawn by
  Mantine. One dynamic route (`pages/docs/@slug`) renders every page from a content registry
  (`docs-content.js`); the sidebar links to the real routes, highlights the active page, splices its
  on-page anchors, and each page has prev/next. Add a page by adding one entry to `DOC_PAGES`.

To see the same trees as shadcn-style built-ins, run `examples/vike-blocks`.

## Run it

```bash
pnpm --filter app-vike-mantine dev   # or: cd examples/vike-mantine && pnpm exec vite
```

React only — Mantine is a React library, so there is no Vue twin.
