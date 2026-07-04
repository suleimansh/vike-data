// /admin/:table — the list. The TABLE (columns, sortable headers, FK cells, per-row edit link,
// empty state) is rendered by vike-crud's ListView — vike-admin is a preset over vike-crud, so
// it draws its list through the same component instead of a second table. This page keeps the
// admin CHROME around it: the title, the "New" button, and prev/next paging. The data hook
// (vike-admin/data:listData) reads just the page through universal-orm and hands over the
// page/sort state; navigation is plain query-string links (`?page=&sort=&dir=`), so it works
// without client JS.
import { useData } from 'vike-react/useData'
import { ListView } from 'vike-crud/react'
import { ConfirmView, PaginationView } from 'vike-blocks/react'

// A per-row Delete control: vike-blocks' `confirm` block guarding a no-JS form that POSTs
// `_action=delete` to the row's edit route, so it reuses the admin's existing owner-scoped
// delete (data:editData) — no new endpoint and no widening of the write surface. Keyed on the
// row's primary key AND the resource scope server-side, so a scoped user can only delete a row
// they own. The confirm block owns the form: with no client JS it submits directly; once
// hydrated the submit is gated behind a themed dialog (replacing the old window.confirm).
function DeleteRowForm({ action }) {
  return (
    <ConfirmView
      label="Delete"
      link
      intent="danger"
      title="Delete this row?"
      description="This cannot be undone."
      confirmLabel="Delete"
      action={{ to: action, method: 'post' }}
      fields={[{ name: '_action', value: 'delete' }]}
    />
  )
}

// Build an /admin/:table URL carrying the paging/sort state; empty params are dropped so a
// default view stays a clean `/admin/:table`.
function listUrl(table, { page, sort, dir }) {
  const qs = new URLSearchParams()
  if (page && page > 1) qs.set('page', String(page))
  if (sort) {
    qs.set('sort', sort)
    if (dir === 'desc') qs.set('dir', 'desc')
  }
  const s = qs.toString()
  return s ? `/admin/${table}?${s}` : `/admin/${table}`
}

export default function ListPage() {
  const { table, label, columns, rows, fkLabels, pk, canCreate, page, pageCount, total, sort, dir } = useData()
  // Per-row permission (#581): the data hook stamped `_canEdit` / `_canDelete` on each row. Show the
  // actions column only when at least one row is actionable; the per-row callback gates each cell.
  const anyEdit = rows.some((r) => r._canEdit)
  const anyDelete = rows.some((r) => r._canDelete)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>{label}</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="/admin" style={{ color: 'var(--color-muted)', fontSize: 14 }}>
            &larr; Admin
          </a>
          {canCreate && (
            <a
              href={`/admin/${table}/new`}
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-primary-text, #fff)',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius, 8px)',
                textDecoration: 'none',
                fontSize: 14,
              }}
            >
              New
            </a>
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 'var(--space-md, 1rem)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius, 10px)',
          overflow: 'hidden',
          background: 'var(--color-surface)',
        }}
      >
        <ListView
          table={table}
          columns={columns}
          rows={rows}
          pk={pk}
          fkLabels={fkLabels}
          sort={sort}
          dir={dir}
          sortHref={(name, nextDir) => listUrl(table, { page: 1, sort: name, dir: nextDir })}
          rowHref={anyEdit ? (row) => (row._canEdit ? `/admin/${table}/${row[pk]}` : undefined) : undefined}
          rowActions={anyDelete ? (row) => (row._canDelete ? <DeleteRowForm action={`/admin/${table}/${row[pk]}`} /> : null) : undefined}
          emptyLabel="No rows yet."
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'var(--space-md, 1rem)',
          fontSize: 14,
          color: 'var(--color-muted)',
        }}
      >
        <span>{total === 0 ? 'No rows' : `Page ${page} of ${pageCount} · ${total} ${total === 1 ? 'row' : 'rows'}`}</span>
        <PaginationView page={page} pageCount={pageCount} href={(p) => listUrl(table, { page: p, sort, dir })} />
      </div>
    </div>
  )
}
