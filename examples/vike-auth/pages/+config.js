// The whole app is one install: vike-react (the renderer) + vike-auth/react. That single
// auth import brings THREE things at once — the server-side session tier (resolves
// `pageContext.user` from the session cookie), the auth strings, AND the extension's own
// /login + /account pages (via config.pages, vike#3356) — so there is no page file in this
// app for either route. A guard on /login bounces an already-signed-in visitor to
// `loginRedirect`.
import vikeReact from 'vike-react/config'
import authExt from 'vike-auth/react'
import themesExt from 'vike-themes/react'
import toolbarExt from 'vike-toolbar/react'
import layoutsExt from 'vike-layouts/react'

export default {
  // The standard vike-data UI tier, each a one-line install:
  //   - themes:  the CSS-variable design tokens the auth components style against. Ships a
  //              built-in `default` theme, so this alone styles the pages (swap in a theme
  //              package or `defineTheme()` to rebrand). Renders the appearance picker.
  //   - toolbar: the floating dev toolbar (installed extensions, theme/appearance switches).
  //   - layouts: the app shell. `layout: 'topbar'` frames the app's own pages; vike-auth's
  //              /login page sets its OWN `layout: 'centered'`, so the sign-in form sits in a
  //              centered card instead of stretching full width.
  extends: [vikeReact, authExt, themesExt, toolbarExt, layoutsExt],

  // The app shell for this app's pages (home, /protected) + the inherited /account. Fill the
  // topbar slots with a logo + nav; the active link is highlighted automatically. The /login
  // page overrides this with its centered card.
  layout: 'topbar',
  logo: '◆ vike-auth',
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Protected', href: '/protected' },
    { label: 'Account', href: '/account', end: true }, // end: true -> trailing (right) side
    { label: 'Login', href: '/login', end: true },
  ],

  // Where a signed-in visitor who hits /login is sent (default '/'). Also where /account
  // links back to. The guarded /protected page sends unauthenticated visitors the other way
  // (to /login?next=/protected) from its own +guard.js.
  loginRedirect: '/account',
  title: 'vike-auth example',
}
