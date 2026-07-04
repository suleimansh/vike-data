// vike-blocks is a plain library, not a Vike extension, so there is nothing to `extends` for it
// here — the pages import <Page>/<Blocks> and the block builders directly. What we DO install is
// the UI tier so the gallery is themed and navigable:
//   - themes:  the --color-* design tokens the blocks style against (they ship fallbacks, so the
//              blocks render without it too, but a theme gives a consistent palette + dark mode).
//              Built-in `default` theme, no config needed. Renders the appearance picker.
//   - toolbar: the floating dev toolbar (installed extensions + theme/appearance switches).
//   - layouts: a topbar shell so every block page has a header back to the gallery index.
import vikeReact from 'vike-react/config'
import themesExt from 'vike-themes/react'
import toolbarExt from 'vike-toolbar/react'
import layoutsExt from 'vike-layouts/react'

export default {
  extends: [vikeReact, themesExt, toolbarExt, layoutsExt],
  title: 'vike-blocks example',

  // The topbar wraps every page; the home page (/) is the full index of blocks, so the nav just
  // carries the logo back home plus a few showcase blocks. The active link highlights automatically.
  layout: 'topbar',
  logo: '◆ vike-blocks',
  nav: [
    { label: 'Gallery', href: '/' },
    { label: 'Button', href: '/button' },
    { label: 'Dialog', href: '/dialog' },
    { label: 'Table', href: '/table' },
    { label: 'Chart', href: '/chart' },
  ],
}
