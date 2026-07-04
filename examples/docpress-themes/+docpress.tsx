export { config as default }

import type { Config } from '@brillout/docpress'
import logo from './assets/logo.svg'
import { headings, headingsDetached } from './headings'
import { headHtml } from './ThemeMenu'

const config: Config = {
  name: 'Themed DocPress',
  version: '0.0.0',
  url: 'docpress-themes.example',
  tagline: 'Theming a DocPress site with vike-themes',
  logo,
  favicon: logo,
  navLogoSize: 30,

  github: 'https://github.com/suleimansh/vike-data',

  headings,
  headingsDetached,

  // The theme switcher lives in the vike-toolbar settings popover (see ir/getPageElement),
  // not DocPress's top-navigation slot — the IR shell replaces DocPress's Layout, so this
  // config's `topNavigation` would never render.
  navMaxWidth: 1140,

  // Inline <head> script that applies the cookie's palette before first paint,
  // so prerendered/static pages don't flash the default theme on load.
  headHtml,
}
