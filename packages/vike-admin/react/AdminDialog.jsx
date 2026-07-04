// The URL-driven admin dialog host (#596). On a `mode: 'dialog'` resource, view / create / edit open
// as an overlay over the list; WHICH one is read straight from the list URL (`?view=id` / `?edit=id`
// / `?create`) and hydrated server-side by listData, so it is shareable and survives a refresh. It
// reuses vike-blocks' Overlay - the SAME primitive vike-crud's CrudDialog wraps (portal + focus-trap
// + Escape + backdrop-click + scroll-lock) - so the behaviour matches the schema-driven CRUD dialog;
// admin just renders its own flat view-model inside instead of the sections pipeline.
//
// The create / edit FORMS post to the EXISTING routes (`/admin/:table/new`, `/admin/:table/:id/edit`),
// which insert / update and redirect to the list - closing the dialog. So there is no bespoke write
// path here. Closing (Escape / backdrop / the ×) navigates to `closeHref` (the list, minus the dialog
// param). The read-only view screen offers Edit (switches to the edit dialog) and Delete (posts to the
// edit route), mirroring the standalone ViewPage.
import { useId } from 'react'
import { navigate } from 'vike/client/router'
import { Overlay } from 'vike-blocks/react'
import { RecordView } from 'vike-crud/react/RecordView'
import { FormFields } from './FormFields.jsx'
import { singular } from '../text.js'

// Theme-native panel, a small scale-in on the shared curve - matched to vike-crud's CrudDialog so the
// two dialogs look identical.
const panelStyle = (visible) => ({
  width: '100%',
  maxWidth: 520,
  padding: '1.25rem',
  background: 'var(--color-bg, var(--color-surface, #ffffff))',
  color: 'var(--color-text, #0f172a)',
  borderRadius: 'var(--radius, 12px)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
  opacity: visible ? 1 : 0,
  transform: visible ? 'scale(1)' : 'scale(0.96)',
  transition: 'opacity 180ms ease, transform 180ms ease',
})

const primaryBtn = {
  background: 'var(--color-primary)',
  color: 'var(--color-primary-text, #fff)',
  border: 'none',
  padding: '0.55rem 1.1rem',
  borderRadius: 'var(--radius, 8px)',
  fontSize: 14,
  textDecoration: 'none',
  cursor: 'pointer',
}
const dangerBtn = {
  background: 'transparent',
  color: 'var(--color-danger, #c0392b)',
  border: '1px solid var(--color-danger, #c0392b)',
  padding: '0.45rem 0.9rem',
  borderRadius: 'var(--radius, 8px)',
  fontSize: 14,
  cursor: 'pointer',
}
const formStyle = { display: 'grid', gap: 'var(--space-md, 1rem)', marginTop: '0.25rem' }

function title(dialog, label) {
  if (!dialog) return ''
  const one = singular(label)
  return dialog.screen === 'create' ? `New ${one}` : dialog.screen === 'edit' ? `Edit ${one}` : one
}

// `dialog` is the hydrated active dialog (or null = closed); `table`/`label` name the resource;
// `closeHref` is the list route to return to; `editHref` switches a view dialog into its edit dialog.
export function AdminDialog({ dialog, table, label, closeHref, editHref }) {
  const titleId = useId()
  const close = () => navigate(closeHref)
  const newAction = `/admin/${table}/new`
  const editAction = dialog?.id != null ? `/admin/${table}/${encodeURIComponent(dialog.id)}/edit` : null

  return (
    <Overlay
      open={!!dialog}
      onClose={close}
      labelledBy={titleId}
      role="dialog"
      containerStyle={{ alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      panelStyle={panelStyle}
    >
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.85rem' }}>
        <h2 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          {title(dialog, label)}
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

      {dialog?.screen === 'view' && (
        <>
          <RecordView table={table} fields={dialog.fields} row={dialog.values} />
          <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', marginTop: 'var(--space-md, 1rem)' }}>
            {dialog.canEdit && editHref && (
              <a href={editHref} style={primaryBtn}>
                Edit
              </a>
            )}
            {dialog.canDelete && editAction && (
              // Delete posts `_action=delete` to the edit route (where the update/delete hook lives).
              <form method="post" action={editAction} style={{ marginLeft: 'auto' }}>
                <input type="hidden" name="_action" value="delete" />
                <button type="submit" style={dangerBtn}>
                  Delete
                </button>
              </form>
            )}
          </div>
        </>
      )}

      {dialog?.screen === 'edit' && editAction && (
        <form method="post" action={editAction} style={formStyle}>
          <FormFields fields={dialog.fields} values={dialog.values} />
          <div>
            <button type="submit" style={primaryBtn}>
              Save
            </button>
          </div>
        </form>
      )}

      {dialog?.screen === 'create' && (
        <form method="post" action={newAction} style={formStyle}>
          <FormFields fields={dialog.fields} />
          <div>
            <button type="submit" style={primaryBtn}>
              Create
            </button>
          </div>
        </form>
      )}
    </Overlay>
  )
}
