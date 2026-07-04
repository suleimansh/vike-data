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
import { ThemeMenu } from '../ThemeMenu'
import type { PageContext } from 'vike/types'

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

  // The navbar: a logo link, then a config-fed theme switcher (the vike-themes ThemeMenu, injected as
  // a React node via slot(from:'config') so it stays out of the serializable IR) + a repo link.
  const header = [
    link(cfg.name).to('/'),
    slot('theme').from('config'),
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
  // slots (currentPath for active highlighting, the theme node).
  return (
    <React.StrictMode>
      <LayoutConfigProvider config={{ currentPath: current, theme: <ThemeMenu /> }}>
        <LayoutView variant={variant} slots={slots} content={<Page />} />
      </LayoutConfigProvider>
    </React.StrictMode>
  )
}
