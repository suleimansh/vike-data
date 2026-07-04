// The generic page shipped for every generated view route. It renders the sections the data hook
// (viewData) hydrated, honouring each section's `present`:
//   - route / inline sections draw in place (a plain <Blocks>);
//   - the list, on a dialog-mode resource, gets row links + a "New" link that set the URL dialog
//     state (?view / ?edit / ?create) — plain <a>s, so Vike's client router turns each into a
//     navigation that re-runs viewData and re-renders with the chosen dialog hydrated;
//   - dialog sections are held back and the active one (read from the URL) is drawn in CrudDialog.
// Importing ./index registers the schema + primitive renderers, so every block type resolves.
import { useData } from 'vike-react/useData'
import { usePageContext } from 'vike-react/usePageContext'
import { Blocks, ListView } from './index.js'
import { CrudDialog } from './CrudDialog.jsx'
import { activeDialog } from './pages.js'

const newLinkStyle = { display: 'inline-block', marginBottom: '0.75rem', color: 'var(--color-primary, #2563eb)', textDecoration: 'none', fontWeight: 500 }
const actionLinkStyle = { color: 'var(--color-primary, #2563eb)', textDecoration: 'none' }

export default function ViewPage() {
  const data = useData()
  const pageContext = usePageContext()
  const sections = data?.sections ?? []
  const pathname = pageContext.urlPathname
  const search = pageContext.urlParsed?.search ?? {}

  const dialogs = sections.filter((s) => s.props?.present === 'dialog')
  const inline = sections.filter((s) => s.props?.present !== 'dialog')
  const screens = new Set(dialogs.map((s) => s.props?.screen))
  const active = activeDialog(search)
  const activeSection = active ? (dialogs.find((s) => s.props?.screen === active.screen) ?? null) : null

  return (
    <>
      {inline.map((s, i) =>
        s.block === 'list' ? (
          <div key={i}>
            {screens.has('create') && (
              <a href={`${pathname}?create`} style={newLinkStyle}>
                + New
              </a>
            )}
            <ListSection section={s} pathname={pathname} screens={screens} />
          </div>
        ) : (
          <Blocks key={i} sections={[s]} />
        ),
      )}
      <CrudDialog section={activeSection} closeHref={pathname} />
    </>
  )
}

// The list, wired to open dialogs. A row links to its view dialog (or edit, if there's no view
// screen); when both exist, view is the row link and edit is a per-row action. `sortHref` keeps
// the list's own sort in the URL. All plain <a>s — the client router handles the navigation.
function ListSection({ section, pathname, screens }) {
  const { pk = 'id' } = section.resolved
  const to = (screen, row) => `${pathname}?${screen}=${encodeURIComponent(row[pk])}`
  const rowHref = screens.has('view') ? (row) => to('view', row) : screens.has('edit') ? (row) => to('edit', row) : undefined
  const rowActions = screens.has('view') && screens.has('edit') ? (row) => <a href={to('edit', row)} style={actionLinkStyle}>Edit</a> : undefined
  const sortHref = (col, dir) => `${pathname}?sort=${encodeURIComponent(col)}&dir=${dir}`
  return <ListView {...section.resolved} rowHref={rowHref} rowActions={rowActions} sortHref={sortHref} />
}
