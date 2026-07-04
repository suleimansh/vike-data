// /admin/:table/:id — the read-only VIEW (detail) page. It renders one row through vike-crud's
// RecordView (the same read-only record block the schema-driven views use), plus Edit / Delete
// controls the data hook (viewData) already gated per record. No form, no POST here — the write
// path lives on the sibling `/edit` route; this page is a plain SSR read.
import { useData } from 'vike-react/useData'
import { BreadcrumbView } from 'vike-blocks/react'
import { RecordView } from 'vike-crud/react/RecordView'
import { singular } from '../text.js'

const primaryBtn = {
  background: 'var(--color-primary)',
  color: 'var(--color-primary-text, #fff)',
  border: 'none',
  padding: '0.5rem 1.1rem',
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

export default function ViewPage() {
  const { table, label: title, fields, values, id, canEdit, canDelete } = useData()
  const editAction = `/admin/${table}/${encodeURIComponent(id)}/edit`

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <BreadcrumbView items={[{ label: 'Admin', to: '/admin' }, { label: title, to: `/admin/${table}` }, { label: singular(title) }]} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0 0' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>{singular(title)}</h1>
        {canEdit && (
          <a href={editAction} style={primaryBtn}>
            Edit
          </a>
        )}
      </div>

      <div
        style={{
          marginTop: 'var(--space-md, 1rem)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius, 10px)',
          padding: 'var(--space-lg, 1.5rem)',
        }}
      >
        <RecordView table={table} fields={fields} row={values} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: 'var(--space-md, 1rem)' }}>
        <a href={`/admin/${table}`} style={{ color: 'var(--color-muted)', fontSize: 14 }}>
          &larr; {title}
        </a>
        {canDelete && (
          // Delete posts `_action=delete` to the edit route (where the update/delete hook lives).
          <form method="post" action={editAction} style={{ marginLeft: 'auto' }}>
            <input type="hidden" name="_action" value="delete" />
            <button type="submit" style={dangerBtn}>
              Delete
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
