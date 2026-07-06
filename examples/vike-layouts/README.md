# vike-layouts example

A runnable walkthrough of [vike-layouts](../../packages/vike-layouts): app shells picked per page
from config, cumulative slots that compose across extensions, and a **custom shell with a custom
slot** — all with no wrapper components and no per-page layout markup.

```bash
pnpm install          # from the repo root
pnpm --filter app-vike-layouts dev
# open http://localhost:4210
```

## What each route shows

| Route | Shell | Point |
|---|---|---|
| `/` | `topbar` (app default) | Set the shell + slots once in `pages/+config.js`. |
| `/sidebar` | `sidebar` | Same slots, different arrangement — a one-line `layout:` override. |
| `/split` | `split` (**custom**) | A shell this app registered, with a custom `aside` slot. |
| `/login` | `centered` (public) | Logo + card; app nav/userMenu are dropped (the shell doesn't declare them). |

## How it's wired

- **`pages/+config.js`** — installs the extensions (`vike-layouts`, `vike-themes`, `vike-toolbar`)
  and sets the app-default `layout`, `logo`, `nav`, `footer`, `userMenu`. `nav`/`footer` are
  cumulative, so an installed extension can contribute its own links into them (they compose).
- **`pages/shells/`** — the custom `split` shell: `register.js` calls `registerShell` (core) +
  `registerLayoutShell` (vike-blocks); `SplitShell.jsx` arranges the built-in slots, adds bespoke
  chrome, and renders a brand-new `aside` slot. `pages/+config.js` declares the `aside` `meta` key.
- **vike-toolbar** — the floating toolbar is a *separate* extension, not a layout slot. It composes
  through its own seam + a global wrapper, so it appears under every shell (`/login` included).

Vue apps use the same core + config; swap the `vike-layouts/react` install for `vike-layouts/vue`.
