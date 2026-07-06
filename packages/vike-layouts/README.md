# vike-layouts

App-shell selection for vike-data: pick a layout per page (`centered` / `topbar` /
`sidebar`) and fill its slots (logo, nav, footer, user menu). Framework-agnostic
core (the shell registry + slot model); the React/Vue bindings ship the shells.

Since #401 the frames are [vike-blocks](../vike-blocks) `layout`-block **variants**: each is
composed of `<SlotView>` regions (chrome from the config seam, page body from the content
seam) and rendered through the block `LayoutView`, so app chrome and page-structure layouts
are one system. The config API below is unchanged.

## Usage

```js
// +config.js
import layoutsExt from 'vike-layouts/react'

export default {
  extends: [layoutsExt],   // self-installs the core
  layout: 'topbar',        // 'centered' | 'topbar' | 'sidebar'
  logo: '◆ Acme',
  nav: [{ label: 'Home', href: '/' }, { label: 'Admin', href: '/admin' }],
}
```

Set `layout` per page (a page can override the app default), and the shell renders only
the slots it declares — slot values for a shell that doesn't render them are ignored.

## Exports

| Subpath | What |
|---|---|
| `.` | The core: `shells()` / `registerShell()` / `defineLayout()` / `shellSlotConfig()` + the slot model. |
| `./config` | The Vike config: the `layout` selection + the `logo` / `nav` slot config (and the cumulative `nav`). |
| `./react`, `./react/ConfigLayout`, `./react/Layout` | The React Layout: registers the `topbar` / `sidebar` frames as block variants and renders through vike-blocks' `LayoutView` (`centered` is the block builtin). |
| `./vue`, `./vue/ConfigLayout` | The Vue twin. |

## Key concepts

- **Shells registry.** Three built-ins (`centered` for public pages, `topbar` / `sidebar`
  for app pages); third-party shells register via `registerShell()`. Under the hood each is
  a `layout`-block variant registered with vike-blocks' `registerLayoutShell()`.
- **Slots.** Each shell declares which slots it renders (the built-ins use `logo`, `nav`,
  `footer`, `userMenu`); a shell that doesn't declare a slot never receives its value, so a
  page can pass extras with no leakage. `nav` / `footer` are **cumulative** — every installed
  extension contributes into them and the values compose.
- **Custom slots.** The slot list is open, not fixed: a custom shell can declare any slot
  name and `defineLayout` threads it exactly like a built-in — see [Custom layouts](#custom-layouts).
- **Toolbar.** There is no toolbar *slot*. [vike-toolbar](../vike-toolbar) is a separate
  extension that mounts its own global wrapper and composes settings controls (theme + locale
  pickers) through its `toolbarItems` seam and a body portal — independent of the layout shell,
  so it works under any shell (or none). Install it alongside vike-layouts; nothing to wire here.
- **Direction.** RTL/LTR follows the document direction [vike-i18n](../vike-i18n) drives
  off the active locale, so an Arabic locale flips every shell.

## Custom layouts

A layout is just a shell (where things go) whose slots you fill. To add your own:

```js
// 1) Register the shell in the agnostic core (kind + the slots it renders).
import { registerShell } from 'vike-layouts'
registerShell('split', { kind: 'app', slots: ['logo', 'nav', 'aside'] }) // `aside` is a custom slot

// 2) Register its component with vike-blocks and draw the slots with <SlotView>.
import { registerLayoutShell } from 'vike-blocks/react/LayoutView'
import { SlotView } from 'vike-blocks/react/SlotView'
function SplitShell() {
  return (
    <div style={{ display: 'flex' }}>
      <aside><SlotView name="aside" from="config" /></aside>
      <main><SlotView from="content" /></main>
    </div>
  )
}
registerLayoutShell('split', SplitShell)

// 3) If the shell adds a NEW slot name, declare a matching meta key so Vike collects it.
//    (Built-in slots — logo/nav/footer/userMenu — are already declared.)
export default {
  meta: { aside: { env: { config: true, server: true, client: true } } },
  layout: 'split',
  aside: 'Filters',
}
```

The [`examples/vike-layouts`](../../examples/vike-layouts) app is a runnable walkthrough:
switching shells per page, contributing custom nav/footer, and a custom `split` shell with a
custom `aside` slot.
