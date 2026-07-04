// The URL-driven CRUD dialog host (#578). On a dialog-mode resource, view / create / edit are
// overlays over the list; WHICH one is open is read straight from the URL (`?view=` / `?edit=` /
// `?create`), so it is shareable and survives a refresh — the server renders `/posts?view=p1` with
// the record dialog's section already hydrated, and this host just reflects it. Reuses vike-blocks'
// Overlay (portal + focus-trap + Escape + backdrop-click + scroll-lock), driving `open` from the URL
// instead of a trigger button. Closing navigates back to the list route, clearing the query.
import { useId } from 'react'
import { navigate } from 'vike/client/router'
import { Overlay } from 'vike-blocks/react'
import { Blocks } from './index.js'

const TITLES = { view: 'Details', create: 'New', edit: 'Edit' }

// The dialog panel: theme-native (var(--color-*) / --radius), a small scale-in on the shared curve.
const panelStyle = (visible) => ({
  width: '100%',
  maxWidth: 480,
  padding: '1.25rem',
  background: 'var(--color-bg, #ffffff)',
  color: 'var(--color-text, #0f172a)',
  borderRadius: 'var(--radius, 12px)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
  opacity: visible ? 1 : 0,
  transform: visible ? 'scale(1)' : 'scale(0.96)',
  transition: 'opacity 180ms ease, transform 180ms ease',
})

// `section` is the active dialog's hydrated section (or null = closed); `closeHref` is the list
// route to return to. A create/edit form inside POSTs to the current URL (FormView emits `_table`
// + `_id`); the data hook writes and redirects to the list, which closes the dialog.
export function CrudDialog({ section, closeHref }) {
  const titleId = useId()
  const close = () => navigate(closeHref)
  return (
    <Overlay
      open={!!section}
      onClose={close}
      labelledBy={titleId}
      role="dialog"
      containerStyle={{ alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      panelStyle={panelStyle}
    >
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.85rem' }}>
        <h2 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          {section ? (TITLES[section.props?.screen] ?? '') : ''}
        </h2>
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          style={{ flexShrink: 0, border: 0, background: 'transparent', cursor: 'pointer', fontSize: 22, lineHeight: 1, color: 'var(--color-muted, #64748b)' }}
        >
          {'×'}
        </button>
      </header>
      {section && <Blocks sections={[section]} />}
    </Overlay>
  )
}
