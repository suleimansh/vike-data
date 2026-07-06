// The config SEAM for layouts — same as themes/billing: install the extension,
// set a sibling config key. vike-layouts declares the contribution points
// (framework-agnostic, no UI here); the React shells are the vike-layouts/react subpath.
//
//   - `layout` : the app-shell to render, by name (centered/topbar/sidebar, or a
//                registered 4th). A single selection, so the app sets a default
//                and a page overrides it — e.g. pages/login/+config.js sets
//                `layout: 'centered'` while the rest of the app stays 'topbar'.
//   - `logo`   : the logo slot (a string for the demo).
//   - `nav`    : the nav slot. CUMULATIVE, so an extension can contribute its own
//                nav links, not just the app.
//   - `footer` : the footer slot. CUMULATIVE, same reason as nav.
//   - `userMenu`: the signed-in user menu slot (a single selection, like logo).
//
// A custom shell (registerShell) that declares its own slot also adds a matching `meta`
// key (from the app or its own extension) so Vike collects that slot's config value.
// vike-toolbar is NOT a slot here: it composes through its own `toolbarItems` seam and a
// global wrapper (see its README), independent of the layout shell.
export default {
  name: 'vike-layouts',
  meta: {
    layout: { env: { config: true, server: true, client: true } },
    logo: { env: { config: true, server: true, client: true } },
    nav: { env: { config: true, server: true, client: true }, cumulative: true },
    footer: { env: { config: true, server: true, client: true }, cumulative: true },
    userMenu: { env: { config: true, server: true, client: true } },
  },
  layout: 'centered',
}
