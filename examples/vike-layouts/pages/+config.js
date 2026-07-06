// The whole app wiring, in one file. The layout is entirely config: install the extension,
// pick a shell, fill its slots.
//
//   - vike-react:   the React renderer.
//   - vike-layouts: the app shell. `layout: 'topbar'` frames every route; a page overrides it.
//   - vike-themes:  the --color-* design tokens the shells style against (+ appearance picker).
//   - vike-toolbar: the floating settings toolbar — a SEPARATE extension, not a layout slot;
//                   it composes through its own seam + a global wrapper, under any shell.
import vikeReact from 'vike-react/config'
import layoutsExt from 'vike-layouts/react'
import themesExt from 'vike-themes/react'
import toolbarExt from 'vike-toolbar/react'

export default {
  extends: [vikeReact, layoutsExt, themesExt, toolbarExt],
  title: 'vike-layouts example',

  // App default: the topbar shell + these slots. Any page below can override `layout` and its
  // slots (see pages/sidebar, pages/split, pages/login). `nav` and `footer` are CUMULATIVE, so an
  // installed extension can contribute its own links into them (they compose, they don't replace);
  // `end: true` sinks a nav item to the trailing side, next to the user menu.
  layout: 'topbar',
  logo: '◆ Acme',
  userMenu: 'Ada L.',
  nav: [
    { label: 'Topbar', href: '/' },
    { label: 'Sidebar', href: '/sidebar' },
    { label: 'Split (custom)', href: '/split' },
    { label: 'Login (public)', href: '/login' },
    { label: 'Docs ↗', href: 'https://vike.dev', end: true },
  ],
  footer: [
    { label: 'vike-layouts', href: 'https://github.com/vikejs/vike' },
    { label: 'Report an issue', href: 'https://github.com/vikejs/vike/issues' },
  ],

  // Declare the custom `aside` slot the `split` shell renders, so Vike collects its value.
  // The built-in slots (logo/nav/footer/userMenu) are already declared by vike-layouts.
  meta: {
    aside: { env: { config: true, server: true, client: true } },
  },
}
