---
'vike-blocks': minor
'vike-layouts': minor
---

Collapse vike-layouts onto the block IR (closes #401): layouts and blocks are now one system.

vike-layouts' app frames (`topbar` / `sidebar` / `centered`) are now `layout`-block VARIANTS rendered through vike-blocks' `LayoutView`, so page-structure layouts and app chrome share ONE variant dispatch and ONE slot flow. Each frame is composed of `<SlotView>` regions: the chrome (logo / nav / userMenu / footer) fills from the config seam (`from:'config'`), and the page body flows through the new content seam (`from:'content'`).

vike-blocks additions:
- `LayoutView` gains an open shell registry (`registerLayoutShell`) and a live-content flow (`content` prop + `LayoutContentContext` / `useLayoutContent`, and the Vue twins).
- `SlotView` gains `from:'content'` (renders the live page body) and an active-aware `from:'config'` nav (`only:'start'|'end'` narrows to leading/trailing items).
- `isActivePath` moves into the core so a config nav can highlight the current item without a vike dependency (the current path is passed in as data).
- New exports: `registerLayoutShell`, `NavRegion`, `useLayoutContent`, `LayoutContentContext` (React) / `LAYOUT_CONTENT_KEY` (Vue).

vike-layouts: the frames are rewritten as SlotView-composed variants; `ConfigLayout` (React + Vue) builds the config + content and renders `<LayoutView>`. The app-facing API is unchanged — `layout: 'topbar'`, `logo`, `nav`, `defineLayout`, `registerShell` all work exactly as before; vike-auth's login and the example apps render identically. vike-layouts now depends on vike-blocks.

Note for apps: because the workspace UI packages are served as source with their own react/vue peer links, an app that renders vike-layouts should dedupe its framework in Vite (`resolve.dedupe: ['react', 'react-dom', 'react/jsx-runtime']`, or `['vue']`) so a cross-package import resolves a single React/Vue. The bundled examples set this.
