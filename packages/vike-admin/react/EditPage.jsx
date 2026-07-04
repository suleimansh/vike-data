// /admin/:table/:id — the detail/edit page. The same fields as the create form, pre-filled
// with the row's current values, POSTing back to its own route. The data hook
// (vike-admin/data:editData) owns the POST: a default submit UPDATES, the Delete control
// (a separate form posting `_action=delete`) DELETEs, both redirecting to the list. No
// client JS, no fetch; plain form posts, SSR all the way.
import { useData } from 'vike-react/useData'
import { BreadcrumbView } from 'vike-blocks/react'
import { FormFields } from './FormFields.jsx'
import { singular } from '../text.js'

export default function EditPage() {
  const data = useData()
  // The agent API (#115) renders this route to run editData's update/delete, then reads the
  // JSON result off pageContext — the HTML is never used. Render nothing rather than crash on
  // the missing form fields.
  if (data.apiWrite) return null
  const { table, label: title, fields, values, id } = data
  const detail = `/admin/${table}/${encodeURIComponent(id)}`
  const action = `${detail}/edit` // the edit route owns the update/delete POST
  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <BreadcrumbView
        items={[
          { label: 'Admin', to: '/admin' },
          { label: title, to: `/admin/${table}` },
          { label: singular(title), to: detail },
          { label: 'Edit' },
        ]}
      />
      <h1 style={{ margin: '0.5rem 0 0', fontSize: 22 }}>Edit {singular(title)}</h1>

      <form
        method="post"
        action={action}
        style={{
          marginTop: 'var(--space-md, 1rem)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius, 10px)',
          padding: 'var(--space-lg, 1.5rem)',
          display: 'grid',
          gap: 'var(--space-md, 1rem)',
        }}
      >
        <FormFields fields={fields} values={values} />
        <div>
          <button
            type="submit"
            style={{
              background: 'var(--color-primary)',
              color: 'var(--color-primary-text, #fff)',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: 'var(--radius, 8px)',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </form>

      {/* Delete is its own form so the row submit stays a clean UPDATE; the data hook keys
          on the `_action` field. */}
      <form method="post" action={action} style={{ marginTop: 'var(--space-md, 1rem)' }}>
        <input type="hidden" name="_action" value="delete" />
        <button
          type="submit"
          style={{
            background: 'transparent',
            color: 'var(--color-danger, #c0392b)',
            border: '1px solid var(--color-danger, #c0392b)',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius, 8px)',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Delete
        </button>
      </form>
    </div>
  )
}

// "Users" -> "User" for the heading; harmless if a label isn't a plain plural.
