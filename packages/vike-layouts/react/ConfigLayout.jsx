// The vike-react Layout contributed by vike-layouts/react. It reads the resolved layout config off
// pageContext and renders the matching app frame around the page.
//
// Since #401 the frames are `layout`-block VARIANTS: this builds the block LayoutView's inputs —
// the chosen `variant`, the chrome config (logo / nav / userMenu / footer / dir), and the live page
// `content` — and renders <LayoutView> wrapped in <LayoutConfigProvider>. The frames themselves
// (topbar/sidebar, and the `centered` builtin) draw from those two seams via <SlotView>. So app
// chrome and page-structure layouts share ONE engine, while this file keeps vike-layouts' config
// API (`layout: 'topbar'`, nav, defineLayout) unchanged.
//
// `currentPath` (from pageContext) is passed into the config so a config-fed nav highlights the
// active item without the block layer taking a vike dependency; it re-provides on every navigation.
import { usePageContext } from 'vike-react/usePageContext'
import { LayoutConfigProvider, LayoutView, registerLayoutShell } from 'vike-blocks/react/LayoutView'
import { defineLayout } from '../index.js'
import { TopbarShell } from './shells/TopbarShell.jsx'
import { SidebarShell } from './shells/SidebarShell.jsx'

// Register the app frames as layout variants (the `centered` variant is the block builtin, reused).
registerLayoutShell('topbar', TopbarShell)
registerLayoutShell('sidebar', SidebarShell)

export default function ConfigLayout({ children }) {
  const pageContext = usePageContext()
  const config = pageContext.config || {}
  const resolved = defineLayout({
    shell: config.layout,
    logo: config.logo,
    userMenu: config.userMenu,
    // `nav`, `footer` and `toolbar` are cumulative -> an array of each source's
    // contribution; flatten before handing them to the shell.
    nav: (config.nav || []).flat(),
    footer: (config.footer || []).flat(),
    toolbar: (config.toolbar || []).flat(),
  })
  const chrome = {
    ...resolved.slots, // logo / nav / footer / userMenu / toolbar (filtered to the shell)
    dir: resolved.dir,
    currentPath: pageContext.urlPathname || '',
  }
  return (
    <LayoutConfigProvider config={chrome}>
      <LayoutView variant={resolved.shell} content={children} />
    </LayoutConfigProvider>
  )
}
