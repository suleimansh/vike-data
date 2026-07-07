// The one URL-driven dialog host (#728) - the Vue twin of vike-crud/react/CrudDialog. view / create /
// edit open as an overlay over a list; WHICH one is open is read from the URL (`?view=` / `?edit=` /
// `?create`) and hydrated server-side, so it is shareable and survives a refresh. Reuses vike-blocks'
// Vue Overlay (portal + focus-trap + Escape + backdrop + scroll-lock) - the same primitive the React
// host uses - so the two match. Authored as a render-function component (like crud's other Vue
// renderers) so a consumer never has to compile a .vue from node_modules. It renders a FLAT dialog
// payload; a preset (vike-admin) themes it via props: write targets (`submit`), heading text
// (`titles`), FK labels, and panel width.
import { h } from 'vue'
import { navigate } from 'vike/client/router'
import { Overlay } from 'vike-blocks/vue'
import { RecordView } from './RecordView.js'
import { FormFields } from './FormFields.js'

const DEFAULT_TITLES = { view: 'Details', create: 'New', edit: 'Edit' }

const makePanelStyle = (maxWidth) => (visible) => ({
  width: '100%',
  maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
  padding: '1.25rem',
  background: 'var(--color-bg, var(--color-surface, #ffffff))',
  color: 'var(--color-text, #0f172a)',
  borderRadius: 'var(--radius, 12px)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
  opacity: visible ? 1 : 0,
  transform: visible ? 'scale(1)' : 'scale(0.96)',
  transition: 'opacity 180ms ease, transform 180ms ease',
})
const containerStyle = { alignItems: 'center', justifyContent: 'center', padding: '1rem' }

const primaryBtn = { background: 'var(--color-primary)', color: 'var(--color-primary-text, #fff)', border: 'none', padding: '0.55rem 1.1rem', borderRadius: 'var(--radius, 8px)', fontSize: '14px', textDecoration: 'none', cursor: 'pointer' }
const dangerBtn = { background: 'transparent', color: 'var(--color-danger, #c0392b)', border: '1px solid var(--color-danger, #c0392b)', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius, 8px)', fontSize: '14px', cursor: 'pointer' }
const formStyle = { display: 'grid', gap: 'var(--space-md, 1rem)', marginTop: '0.25rem' }

// The hidden inputs a preset wants POSTed with the write (`_table`/`_id` for the crud single-page
// write, `_action=delete` for admin's delete).
const hidden = (fields) => (fields ?? []).map((f) => h('input', { key: f.name, type: 'hidden', name: f.name, value: f.value }))

function body(props) {
  const { dialog, table, fkLabels, editHref, submit = {} } = props
  if (dialog?.screen === 'view') {
    const showActions = (dialog.canEdit && editHref) || (dialog.canDelete && submit.delete)
    return [
      h(RecordView, { table, fields: dialog.fields, row: dialog.values, fkLabels }),
      showActions
        ? h('div', { style: { display: 'flex', gap: '0.9rem', alignItems: 'center', marginTop: 'var(--space-md, 1rem)' } }, [
            dialog.canEdit && editHref ? h('a', { href: editHref, style: primaryBtn }, 'Edit') : null,
            // Delete posts `_action=delete` to the write route (where the update/delete hook lives).
            dialog.canDelete && submit.delete
              ? h('form', { method: 'post', action: submit.delete.to, style: { marginLeft: 'auto' } }, [...hidden(submit.delete.fields), h('button', { type: 'submit', style: dangerBtn }, 'Delete')])
              : null,
          ])
        : null,
    ]
  }
  if (dialog?.screen === 'edit' && submit.edit) {
    return h('form', { method: 'post', action: submit.edit.to, style: formStyle }, [
      ...hidden(submit.edit.fields),
      h(FormFields, { fields: dialog.fields, values: dialog.values }),
      h('div', [h('button', { type: 'submit', style: primaryBtn }, 'Save')]),
    ])
  }
  if (dialog?.screen === 'create' && submit.create) {
    return h('form', { method: 'post', action: submit.create.to, style: formStyle }, [
      ...hidden(submit.create.fields),
      h(FormFields, { fields: dialog.fields }),
      h('div', [h('button', { type: 'submit', style: primaryBtn }, 'Create')]),
    ])
  }
  return null
}

export const CrudDialog = (props) => {
  const { dialog, closeHref, titles, panelMaxWidth = 520 } = props
  const close = () => navigate(closeHref)
  const heading = dialog ? (titles ?? DEFAULT_TITLES)[dialog.screen] ?? '' : ''
  return h(
    Overlay,
    { open: !!dialog, onClose: close, labelledBy: 'crud-dialog-title', role: 'dialog', containerStyle, panelStyle: makePanelStyle(panelMaxWidth) },
    {
      default: () => [
        h('header', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.85rem' } }, [
          h('h2', { id: 'crud-dialog-title', style: { margin: 0, fontSize: '18px', fontWeight: 600 } }, heading),
          h('button', { type: 'button', 'aria-label': 'Close', onClick: close, style: { flexShrink: 0, border: 0, background: 'transparent', cursor: 'pointer', fontSize: '22px', lineHeight: 1, color: 'var(--color-muted, #64748b)' } }, '×'),
        ]),
        body(props),
      ],
    },
  )
}
CrudDialog.props = ['dialog', 'table', 'fkLabels', 'titles', 'closeHref', 'editHref', 'submit', 'panelMaxWidth']
