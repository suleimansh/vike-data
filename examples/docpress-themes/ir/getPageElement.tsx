export { getPageElement }

// The #420 proof: DocPress's page shell expressed on the vike-blocks IR, so the renderer is
// swappable. DocPress already resolves a normalized model onto `pageContext.resolved`
// (navItemsAll / pageTitle / isLandingPage); this maps that model onto a `layout('docs')` block —
// the sidebar is a `docNav` block, the navbar composes from `link` + a config-fed theme slot, the
// mobile menu is a `dialog` holding the same nav, and the MDX `<Page/>` flows into the article region
// via `slot('article').from('content')`. Nothing here re-derives DocPress's data; it only swaps the
// drawer. The seam is a single function (getPageElement), same as DocPress's own — the example's
// onRenderHtml / onRenderClient call this instead of DocPress's `<Layout>`.
import React from 'react'
import { definePage, resolvePage, layout, slot, docNav, groupLeveledItems, link, dialog } from 'vike-blocks'
// Importing the react barrel registers every block renderer (layout / slot / doc-nav / link / dialog).
import { LayoutView, LayoutConfigProvider } from 'vike-blocks/react'
// The theme picker lives in the vike-toolbar settings popover, not the navbar. This example uses a
// custom renderer (DocPress is not vike-react), so the toolbar's vike-react Wrapper / bodyHtmlEnd
// don't fire — we mount its renderer-agnostic `Toolbar` here directly and inject its `#vike-toolbar-
// root` mount node in +onRenderHtml. ThemeMenu is a self-contained control, so it drops in as an item.
import { Toolbar } from 'vike-toolbar/react/Toolbar'
import { ThemeMenu } from '../ThemeMenu'
import type { PageContext } from 'vike/types'

// Mount the toolbar one tick AFTER hydration. vike-toolbar's Toolbar resolves its portal target
// synchronously on the first client render, so under this custom renderer it would render the popover
// during hydration while the server rendered only the button = a mismatch. Deferring to a post-mount
// effect makes the first client render match the server (nothing), then the toolbar appears.
function DeferredToolbar() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  return mounted ? <Toolbar items={[{ id: 'theme', Control: ThemeMenu }]} /> : null
}

function getPageElement(pageContext: PageContext) {
  const { Page } = pageContext
  const { navItemsAll, navItemsDetached, isLandingPage } = pageContext.resolved
  const cfg = pageContext.globalContext.config.docpress
  const current = pageContext.urlPathname

  // The DocPress nav model is a flat, leveled list (1 = category, 2 = page, 3 = on-page section);
  // groupLeveledItems folds it into doc-nav's grouped tree with no per-item rewrite. A detached page
  // (no category) uses its own item list, mirroring DocPress's NavLeft.
  const leveled = navItemsDetached ?? navItemsAll
  const navTree = () => docNav().current(current).tree(groupLeveledItems(leveled))

  // The navbar: a logo link + a repo link. The theme switcher moved to the toolbar popover (below).
  const header = [
    link(cfg.name).to('/'),
    ...(cfg.github ? [link('GitHub ↗').to(cfg.github)] : []),
  ]

  const lay = layout('docs')
    .slot('header', header)
    .slot('article', [slot('article').from('content')]) // the live MDX <Page/> flows in here

  // Docs pages get the sidebar tree + a mobile-menu dialog; the landing page is chrome-only.
  if (!isLandingPage) {
    lay.slot('sidebar', [navTree()])
    lay.slot('mobileMenu', [dialog().trigger('☰ Menu').title('Documentation').sections([navTree()])])
  }

  const { variant, slots } = resolvePage(definePage({ sections: [lay] })).sections[0].resolved

  // Render LayoutView directly (not via <Blocks>) so we can hand it the live page body as `content`;
  // the article's slot(from:'content') placeholder draws it. LayoutConfigProvider feeds the config
  // slots (currentPath for active highlighting). The toolbar mounts alongside the shell: its button
  // renders in-tree, its popover portals into the injected #vike-toolbar-root, and it renders the
  // theme picker as a settings item.
  return (
    <React.StrictMode>
      <LayoutConfigProvider config={{ currentPath: current }}>
        <LayoutView variant={variant} slots={slots} content={<Page />} />
        <DeferredToolbar />
      </LayoutConfigProvider>
    </React.StrictMode>
  )
}
