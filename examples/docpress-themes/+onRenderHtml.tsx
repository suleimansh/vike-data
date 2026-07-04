export { onRenderHtml }

// The server render, overriding DocPress's (Vike lets an app config override an extended one). It
// reuses DocPress's resolved model + config wholesale and only swaps the page element: the IR docs
// shell (see ir/getPageElement) instead of DocPress's `<Layout>`. The <head> reproduces the essentials
// for this theming example — title, favicon, viewport, and the theme no-flash `headHtml`; a real
// integration would keep DocPress's full head (og / algolia / analytics), which is why the honest
// long-term seam is an injectable getPageElement upstream, not this override.
import ReactDOMServer from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { TOOLBAR_ROOT_ID } from 'vike-toolbar'
import { getPageElement } from './ir/getPageElement'
import type { PageContextServer } from 'vike/types'

async function onRenderHtml(pageContext: PageContextServer) {
  const pageHtml = ReactDOMServer.renderToString(getPageElement(pageContext))

  const cfg = pageContext.globalContext.config.docpress
  const { documentTitle, isLandingPage } = pageContext.resolved
  const favicon = typeof cfg.favicon === 'string' ? cfg.favicon : cfg.logo
  const description = isLandingPage && cfg.tagline ? escapeInject`<meta name="description" content="${cfg.tagline}" />` : ''
  const headHtml = cfg.headHtml ? dangerouslySkipEscape(cfg.headHtml) : ''

  return escapeInject`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" href="${favicon}" type="image/svg+xml" />
        <title>${documentTitle}</title>
        ${description}
        <meta name="viewport" content="width=device-width,initial-scale=1">
        ${headHtml}
        <!-- Theme the page backdrop + fill the viewport. The palette (headHtml) sets --color-bg on
             body; this makes the body itself paint it and stretch full height, so the area below a
             short page (and any overscroll) stays themed instead of showing white. -->
        <style>html,body{margin:0}body{min-height:100vh;background:var(--color-bg,#fff)}</style>
      </head>
      <body>
        <div id="page-view">${dangerouslySkipEscape(pageHtml)}</div>
        <!-- vike-toolbar's popover portals into this node, kept OUTSIDE the hydration root. Normally
             vike-toolbar contributes it via bodyHtmlEnd; the custom renderer injects it here. -->
        <div id="${TOOLBAR_ROOT_ID}"></div>
      </body>
    </html>`
}
