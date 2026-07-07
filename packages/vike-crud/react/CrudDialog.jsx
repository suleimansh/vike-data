// The one URL-driven dialog host (#728). view / create / edit open as an overlay over a list; WHICH
// one is open is read straight from the URL (`?view=` / `?edit=` / `?create`), so it is shareable and
// survives a refresh — the server hydrates the active dialog's payload and this host just reflects it.
// Reuses vike-blocks' Overlay (portal + focus-trap + Escape + backdrop-click + scroll-lock), driving
// `open` from the URL instead of a trigger. Closing navigates back to the list, clearing the query.
//
// It renders a FLAT dialog payload (`{ screen, id, fields, values, canEdit, canDelete }`), the shape
// vike-crud's `loadDialogPayload` returns and a per-page resource adapts its hydrated section into
// (dialogFromSection). vike-admin used to ship its own AdminDialog; it now themes THIS host — the
// write targets (`submit`), heading text (`titles`), FK labels and panel width are all props, so a
// preset points the forms at its own routes without a second component.
import { useId } from 'react'
import { navigate } from 'vike/client/router'
import { Overlay } from 'vike-blocks/react'
import { RecordView } from './RecordView.jsx'
import { FormFields } from './FormFields.jsx'

const DEFAULT_TITLES = { view: 'Details', create: 'New', edit: 'Edit' }

// Theme-native panel, a small scale-in on the shared curve.
const makePanelStyle = (maxWidth) => (visible) => ({
  width: '100%',
  maxWidth,
  padding: '1.25rem',
  background: 'var(--color-bg, var(--color-surface, #ffffff))',
  color: 'var(--color-text, #0f172a)',
  borderRadius: 'var(--radius, 12px)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
  opacity: visible ? 1 : 0,
  transform: visible ? 'scale(1)' : 'scale(0.96)',
  transition: 'opacity 180ms ease, transform 180ms ease',
})

const primaryBtn = { background: 'var(--color-primary)', color: 'var(--color-primary-text, #fff)', border: 'none', padding: '0.55rem 1.1rem', borderRadius: 'var(--radius, 8px)', fontSize: 14, textDecoration: 'none', cursor: 'pointer' }
const dangerBtn = { background: 'transparent', color: 'var(--color-danger, #c0392b)', border: '1px solid var(--color-danger, #c0392b)', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius, 8px)', fontSize: 14, cursor: 'pointer' }
const formStyle = { display: 'grid', gap: 'var(--space-md, 1rem)', marginTop: '0.25rem' }

// The hidden inputs a preset wants POSTed with the write (`_table`/`_id` for the crud single-page
// write, `_action=delete` for admin's delete). `submit.<screen>` is `{ to, fields }` or absent.
const Hidden = ({ fields }) => (fields ?? []).map((f) => <input key={f.name} type="hidden" name={f.name} value={f.value} />)

// `dialog` is the hydrated active dialog (or null = closed). `table` names the resource for
// RecordView/FormFields; `fkLabels` (optional) lets the view screen show FK labels. `titles` overrides
// the heading per screen. `closeHref` is where close navigates; `editHref` (optional) turns a view
// dialog's Edit into a link to the edit dialog. `submit` carries each write form's `{ to, fields }`.
export function CrudDialog({ dialog, table, fkLabels, titles, closeHref, editHref, submit = {}, panelMaxWidth = 520 }) {
  const titleId = useId()
  const close = () => navigate(closeHref)
  const heading = dialog ? (titles ?? DEFAULT_TITLES)[dialog.screen] ?? '' : ''

  return (
    <Overlay
      open={!!dialog}
      onClose={close}
      labelledBy={titleId}
      role="dialog"
      containerStyle={{ alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      panelStyle={makePanelStyle(panelMaxWidth)}
    >
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.85rem' }}>
        <h2 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          {heading}
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
          <RecordView table={table} fields={dialog.fields} row={dialog.values} fkLabels={fkLabels} />
          {(dialog.canEdit && editHref) || (dialog.canDelete && submit.delete) ? (
            <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', marginTop: 'var(--space-md, 1rem)' }}>
              {dialog.canEdit && editHref && (
                <a href={editHref} style={primaryBtn}>
                  Edit
                </a>
              )}
              {dialog.canDelete && submit.delete && (
                // Delete posts `_action=delete` to the write route (where the update/delete hook lives).
                <form method="post" action={submit.delete.to} style={{ marginLeft: 'auto' }}>
                  <Hidden fields={submit.delete.fields} />
                  <button type="submit" style={dangerBtn}>
                    Delete
                  </button>
                </form>
              )}
            </div>
          ) : null}
        </>
      )}

      {dialog?.screen === 'edit' && submit.edit && (
        <form method="post" action={submit.edit.to} style={formStyle}>
          <Hidden fields={submit.edit.fields} />
          <FormFields fields={dialog.fields} values={dialog.values} />
          <div>
            <button type="submit" style={primaryBtn}>
              Save
            </button>
          </div>
        </form>
      )}

      {dialog?.screen === 'create' && submit.create && (
        <form method="post" action={submit.create.to} style={formStyle}>
          <Hidden fields={submit.create.fields} />
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
