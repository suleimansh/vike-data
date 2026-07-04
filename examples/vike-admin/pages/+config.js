// One install each, wired the idiomatic way:
//   - vike-react: the renderer.
//   - vike-auth/react: the session tier + /login + /account. vike-admin's /admin/* pages are
//     fenced to signed-in users (their guard redirects anon -> /login), so auth is required;
//     the two are loosely coupled (admin just reads pageContext.user).
//   - vike-admin/react: the /admin/* list/create/edit/delete pages + the cumulative
//     `adminResources` seam. No page file in this app for either route set.
//
// The app contributes its OWN tables through the cumulative `schemas` point (blog.schema.js)
// and its resources through `adminResources` (the sibling +adminResources.js, pointer-imported
// because resources carry functions — canView/canEdit — Vike can't serialize inline).
import vikeReact from 'vike-react/config'
import authExt from 'vike-auth/react'
import adminExt from 'vike-admin/react'
import themesExt from 'vike-themes/react'
import toolbarExt from 'vike-toolbar/react'
import layoutsExt from 'vike-layouts/react'
import { postsSchema, tagsSchema } from './blog.schema.js'

export default {
  // The standard vike-data UI tier, each a one-line install:
  //   - themes:  the CSS-variable design tokens the admin tables + auth pages style against.
  //              Ships a built-in `default` theme, so this alone styles the pages (swap in a
  //              theme package or `defineTheme()` to rebrand). Renders the appearance picker.
  //   - toolbar: the floating dev toolbar (installed extensions, theme/appearance switches).
  //   - layouts: the app shell. `layout: 'topbar'` frames every page incl. the admin panel;
  //              vike-auth's /login page sets its OWN `layout: 'centered'` (a centered card).
  extends: [vikeReact, authExt, adminExt, themesExt, toolbarExt, layoutsExt],

  // The app shell: a topbar with a logo + nav. The admin /admin/* pages render inside it; the
  // /login page overrides with its centered card.
  layout: 'topbar',
  logo: '◆ vike-admin',
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Admin', href: '/admin' },
    { label: 'Account', href: '/account', end: true }, // end: true -> trailing (right) side
    { label: 'Login', href: '/login', end: true },
  ],

  schemas: [postsSchema, tagsSchema],
  loginRedirect: '/admin', // signed-in visitors hitting /login land on the panel
  title: 'vike-admin example',
}
