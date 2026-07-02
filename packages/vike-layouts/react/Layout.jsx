// <Layout> — the manual wrapper: pick a frame by name and render children inside it, for a page
// that mounts the shell itself instead of via the `layout:` config + ConfigLayout. Since #401 it
// renders through the block LayoutView like ConfigLayout does, so both paths share one engine.
// Importing ./ConfigLayout registers the topbar/sidebar variants (centered is the block builtin).
// A manual mount has no pageContext, so a config nav won't highlight here — use the `layout:` config
// path (ConfigLayout) when you want active-nav.
import { LayoutConfigProvider, LayoutView } from 'vike-blocks/react/LayoutView'
import { defineLayout } from '../index.js'
import './ConfigLayout.jsx' // side-effect: registers the topbar/sidebar shells

export function Layout({ children, shells = {}, ...config }) {
  const resolved = defineLayout(config)
  const chrome = { ...resolved.slots, dir: resolved.dir }
  return (
    <LayoutConfigProvider config={chrome}>
      <LayoutView variant={resolved.shell} content={children} shells={shells} />
    </LayoutConfigProvider>
  )
}
