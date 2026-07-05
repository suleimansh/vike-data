// The docs-shell page. Renders the shared `docsPage` — a `layout('docs')` descriptor with a nav
// tree, sticky header, and article — through the registry (<Page>). `layout('docs')` resolves via
// the built-in LayoutView to the Mantine `docs` shell we registered with registerLayoutShell, so the
// two-column documentation frame is drawn by Mantine while the sidebar/headings fall through to
// built-ins and the article's alert/button are Mantine. Same layout("docs") IR as the built-in
// DocsShell — swap the renderer, keep the block (#420).
import { Box } from '@mantine/core'
import { Page } from 'vike-blocks/react'
import { docsPage } from '../../shared-page.js'

export default function DocsPage() {
  // A bordered, resizable frame so the sticky navbar + sidebar are visible without leaving the app nav.
  return (
    <Box m="lg" style={{ height: 560, overflow: 'auto', border: '1px solid var(--mantine-color-default-border)', borderRadius: 12, resize: 'vertical' }}>
      <Page page={docsPage} />
    </Box>
  )
}
