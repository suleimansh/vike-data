// The generic page shipped for every generated view route. It renders the sections the data hook
// (viewData) hydrated, honouring each section's `present`:
//   - dialog sections are held back; the active one (read from the URL) is drawn in CrudDialog;
//   - every other section draws in place — but only if it has content (sectionHasContent), so an
//     empty record / empty edit form never stacks on an index (the empty `<dl>` this epic killed);
//   - the list is wired for navigation from its `nav` descriptor: each row links to the view (or
//     edit) screen and a "New" link opens create, each pointing at a route URL or a `?screen=`
//     query per that screen's presentation. Inline screens need no link — they're already on the
//     page (a create form stacked under the list). Plain <a>s, so the client router navigates.
// Importing ./index registers the schema + primitive renderers, so every block type resolves.
import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import { Blocks, ListView } from './index.js'
import { CrudDialog } from './CrudDialog.jsx'
import { activeDialog, sectionHasContent } from './pages.js'

const newLinkStyle = { display: 'inline-block', marginBottom: '0.75rem', color: 'var(--color-primary, #2563eb)', textDecoration: 'none', fontWeight: 500 }
const actionLinkStyle = { color: 'var(--color-primary, #2563eb)', textDecoration: 'none' }

export default function ViewPage() {
  const data = useData()
  const pageContext = usePageContext()
  const sections = data?.sections ?? []
  const pathname = pageContext.urlPathname
  const search = pageContext.urlParsed?.search ?? {}

  const dialogs = sections.filter((s) => s.props?.present === 'dialog')
  const inPlace = sections.filter((s) => s.props?.present !== 'dialog' && sectionHasContent(s))
  const active = activeDialog(search)
  const activeSection = active ? (dialogs.find((s) => s.props?.screen === active.screen) ?? null) : null

  return (
    <>
      {inPlace.map((s, i) => (s.block === 'list' ? <ListSection key={i} section={s} pathname={pathname} /> : <Blocks key={i} sections={[s]} />))}
      <CrudDialog section={activeSection} closeHref={pathname} />
    </>
  )
}

// The list, wired to navigate to each screen per the resource's `nav` descriptor: `route` -> the
// screen's own URL, `dialog` -> a `?screen=id` query on the list, `inline`/absent -> no link.
function ListSection({ section, pathname }) {
  const nav = section.props?.nav ?? {}
  const base = nav.base ?? pathname
  const pk = section.resolved.pk ?? 'id'

  const linkTo = (screen, id) => {
    const mode = nav[screen]
    if (mode === 'route') return screen === 'view' ? `${base}/${id}` : screen === 'edit' ? `${base}/${id}/edit` : `${base}/new`
    if (mode === 'dialog') return screen === 'create' ? `${base}?create` : `${base}?${screen}=${encodeURIComponent(id)}`
    return null // inline or absent: no link (an inline create form is already on the page)
  }

  const rowScreen = nav.view ? 'view' : nav.edit ? 'edit' : null
  const rowHref = rowScreen && nav[rowScreen] !== 'inline' ? (row) => linkTo(rowScreen, row[pk]) : undefined
  const rowActions = nav.view && nav.edit && nav.edit !== 'inline' ? (row) => <a href={linkTo('edit', row[pk])} style={actionLinkStyle}>Edit</a> : undefined
  const createHref = nav.create && nav.create !== 'inline' ? linkTo('create') : null
  const sortHref = (col, dir) => `${pathname}?sort=${encodeURIComponent(col)}&dir=${dir}`

  return (
    <div>
      {createHref && (
        <a href={createHref} style={newLinkStyle}>
          + New
        </a>
      )}
      <ListView {...section.resolved} rowHref={rowHref} rowActions={rowActions} rowActionLabel={rowScreen === 'view' ? 'View' : 'Edit'} sortHref={sortHref} />
    </div>
  )
}
