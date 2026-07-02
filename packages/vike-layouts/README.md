# vike-layouts

App-shell selection for vike-data: pick a layout per page (`centered` / `topbar` /
`sidebar`) and fill its slots (logo, nav, footer, user menu, toolbar). Framework-agnostic
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
| `.` | The core: `shells()` / `registerShell()` / `defineLayout()` + the slot model. |
| `./config` | The Vike config: the `layout` selection + the `logo` / `nav` slot config (and the cumulative `nav`). |
| `./react`, `./react/ConfigLayout`, `./react/Layout` | The React Layout: registers the `topbar` / `sidebar` frames as block variants and renders through vike-blocks' `LayoutView` (`centered` is the block builtin). |
| `./vue`, `./vue/ConfigLayout` | The Vue twin. |

## Key concepts

- **Shells registry.** Three built-ins (`centered` for public pages, `topbar` / `sidebar`
  for app pages); third-party shells register via `registerShell()`. Under the hood each is
  a `layout`-block variant registered with vike-blocks' `registerLayoutShell()`.
- **Slots.** Each shell declares which slots it renders (`logo`, `nav`, `footer`,
  `userMenu`); a shell that doesn't render a slot silently drops its value.
- **Toolbar slot.** App shells can opt into a cumulative toolbar slot that
  [vike-toolbar](../vike-toolbar) populates (theme + locale pickers), so the chrome
  composes across extensions.
- **Direction.** RTL/LTR follows the document direction [vike-i18n](../vike-i18n) drives
  off the active locale, so an Arabic locale flips every shell.
