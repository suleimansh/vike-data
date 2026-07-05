// The docs-shell page. Renders the shared `docsPage` — a `layout('docs')` descriptor with a nav
// tree, sticky header, and article — through the registry (<Page>). `layout('docs')` resolves via
// the built-in LayoutView to the Mantine `docs` shell we registered with registerLayoutShell, so the
// two-column documentation frame is drawn by Mantine while the sidebar/headings fall through to
// built-ins and the article's alert/button are Mantine. Same layout("docs") IR as the built-in
// DocsShell — swap the renderer, keep the block (#420).
//
// It fills the page (no artificial frame): the shell's own sticky navbar is the page header — the app
// chrome header is hidden on this route (see pages/Layout.jsx) so the shell reads as a real doc site.
import { Page } from 'vike-blocks/react'
import { docsPage } from '../../shared-page.js'

export default function DocsPage() {
  return <Page page={docsPage} />
}
