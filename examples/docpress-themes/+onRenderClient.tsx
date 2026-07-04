export { onRenderClient }

// The client render, overriding DocPress's — the twin of +onRenderHtml so hydration matches (both draw
// the IR docs shell). Importing DocPress's stylesheet keeps the article's MDX (prose, code blocks)
// styled; the shell + doc-nav bring their own theme-native styles. Minimal on purpose: this PoC drops
// DocPress's client extras (auto-scroll nav, docsearch, analytics) to keep the seam small.
import ReactDOM from 'react-dom/client'
import { getPageElement } from './ir/getPageElement'
import type { PageContextClient } from 'vike/types'
import '@brillout/docpress/style'

let root: ReactDOM.Root | undefined

async function onRenderClient(pageContext: PageContextClient) {
  const page = getPageElement(pageContext)
  const container = document.getElementById('page-view')!
  if (pageContext.isHydration) {
    root = ReactDOM.hydrateRoot(container, page)
  } else {
    if (!root) root = ReactDOM.createRoot(container)
    root.render(page)
  }
  document.title = pageContext.resolved.documentTitle
}
