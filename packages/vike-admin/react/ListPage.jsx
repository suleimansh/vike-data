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
import { AdminDialog } from './AdminDialog.jsx'

const actionLinkStyle = { color: 'var(--color-primary, #2563eb)', textDecoration: 'none', fontSize: 14 }

// A per-row Delete control: vike-blocks' `confirm` block guarding a no-JS form that POSTs
// `_action=delete` to the row's EDIT route (where the update/delete hook lives), so it reuses the
// admin's existing owner-scoped delete (data:editData) — no new endpoint and no widening of the
// write surface. Keyed on the row's primary key AND the resource scope server-side, so a scoped
// user can only delete a row they own. The confirm block owns the form: with no client JS it
// submits directly; once hydrated the submit is gated behind a themed dialog.
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

// The per-row action cell: an Edit link and/or a Delete control, each shown only when this user may
// perform it (the data hook stamped `_canEdit` / `_canDelete`). `editHref` is where Edit points (the
// row's edit route, or a `?edit=id` dialog query in dialog mode); Delete always posts to the edit
// route (where the update/delete hook lives), unchanged by presentation mode.
function RowActions({ editHref, deleteAction, row }) {
  return (
    <span style={{ display: 'inline-flex', gap: '0.9rem', alignItems: 'center' }}>
      {row._canEdit && (
        <a href={editHref} style={actionLinkStyle}>
          Edit
        </a>
      )}
      {row._canDelete && <DeleteRowForm action={deleteAction} />}
    </span>
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

// Dialog mode (#596): a screen is a query param ON the list URL (`?view=id` / `?edit=id` / `?create`),
// preserving the current page/sort so the list stays put behind the overlay. `?create` is emitted
// bare (no `=`), matching vike-crud's dialog links.
function dialogHref(table, { page, sort, dir }, param, id) {
  const qs = new URLSearchParams()
  if (page && page > 1) qs.set('page', String(page))
  if (sort) {
    qs.set('sort', sort)
    if (dir === 'desc') qs.set('dir', 'desc')
  }
  const base = qs.toString()
  const sep = base ? '&' : '?'
  const screen = id != null ? `${param}=${encodeURIComponent(id)}` : param
  return `/admin/${table}${base ? `?${base}` : ''}${sep}${screen}`
}

export default function ListPage() {
  const { table, label, columns, rows, fkLabels, pk, canCreate, page, pageCount, total, sort, dir, mode, dialog } = useData()
  // Presentation (#596): in 'dialog' mode the list links open view/create/edit as an overlay on THIS
  // route via a query param; in 'route' mode (the default) they navigate to the /admin/:table/... pages.
  const isDialog = mode === 'dialog'
  const st = { page, sort, dir }
  const newHref = isDialog ? dialogHref(table, st, 'create') : `/admin/${table}/new`
  const viewHref = (id) => (isDialog ? dialogHref(table, st, 'view', id) : `/admin/${table}/${id}`)
  const editHref = (id) => (isDialog ? dialogHref(table, st, 'edit', id) : `/admin/${table}/${id}/edit`)
  const deleteAction = (id) => `/admin/${table}/${id}/edit` // the write path is the edit route in both modes
  // Per-row permission (#581): the data hook stamped `_canView` / `_canEdit` / `_canDelete` on each
  // row. A row links to its detail view when viewable; the actions column (Edit + Delete) shows only
  // when at least one row is actionable, and each per-row callback gates its own cell.
  const anyView = rows.some((r) => r._canView)
  const anyActions = rows.some((r) => r._canEdit || r._canDelete)

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
              href={newHref}
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
          rowHref={anyView ? (row) => (row._canView ? viewHref(row[pk]) : undefined) : undefined}
          rowActions={anyActions ? (row) => <RowActions editHref={editHref(row[pk])} deleteAction={deleteAction(row[pk])} row={row} /> : undefined}
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

      {/* Dialog mode (#596): the overlay is portalled, so it renders regardless of position. `dialog`
          is the URL-active screen the hook hydrated (or null = closed); Edit inside a view dialog
          switches to the edit dialog for the same row. */}
      {isDialog && (
        <AdminDialog
          dialog={dialog}
          table={table}
          label={label}
          closeHref={listUrl(table, { page, sort, dir })}
          editHref={dialog?.id != null ? editHref(dialog.id) : null}
        />
      )}
    </div>
  )
}
