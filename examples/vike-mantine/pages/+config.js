// vike-blocks is a plain library, not a Vike extension, so there is nothing to `extends` for it — a
// page imports <Page>/<Blocks> and the block builders directly. We install vike-react (the React
// renderer) and set a Layout that wraps every page in <MantineProvider> and performs the Mantine
// renderer swap. No vike-themes here on purpose: Mantine brings its OWN theming, and the built-in
// block renderers used in the parity strip fall back to their own colors when no --color-* theme is
// present, so the two kits read as two distinct looks.
import vikeReact from 'vike-react/config'
import Layout from './Layout.jsx'

export default {
  extends: [vikeReact],
  Layout,
  title: 'vike-blocks × Mantine',
  // Mantine components (Modal, Tabs) rely on client hydration; SSR renders their static shell.
}
