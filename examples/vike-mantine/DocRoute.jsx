// One component drives every /docs route (the index and the dynamic /docs/@slug pages): read the
// current path, build the matching doc page from the content registry, and draw it through the
// registry (<Page>), i.e. in Mantine. Both +Page files re-export this.
import { usePageContext } from 'vike-react/usePageContext'
import { Page } from 'vike-blocks/react'
import { buildDocPage } from './docs-content.js'

export default function DocRoute() {
  const { urlPathname } = usePageContext()
  return <Page page={buildDocPage(urlPathname)} />
}
