<script setup>
// /admin/:table — the list. The TABLE (columns, sortable headers, FK cells, per-row edit link,
// empty state) is rendered by vike-crud/vue's ListView — vike-admin is a preset over vike-crud, so
// it draws its list through the same component instead of a second table (mirrors
// vike-admin/react/ListPage). This page keeps the admin CHROME around it: the title, the "New"
// button, and prev/next paging. Navigation is plain query-string links (`?page=&sort=&dir=`), so
// it works without client JS.
import { h } from 'vue'
import { useData } from 'vike-vue/useData'
import { ListView, CrudDialog } from 'vike-crud/vue'
import { ConfirmView, PaginationView } from 'vike-blocks/vue'
import { dialogTitles, adminSubmit } from '../text.js'

const data = useData()

// Build an /admin/:table URL carrying the paging/sort state; empty params are dropped so a default
// view stays a clean `/admin/:table`.
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

// Dialog mode (#598): a screen is a query param ON the list URL (`?view=id` / `?edit=id` / `?create`),
// preserving the current page/sort so the list stays put behind the overlay. `?create` is emitted bare.
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

// Presentation (#598): in 'dialog' mode the list links open view/create/edit as an overlay on THIS
// route via a query param; in 'route' mode (the default) they navigate to the /admin/:table/... pages.
const isDialog = data.mode === 'dialog'
const st = { page: data.page, sort: data.sort, dir: data.dir }
const newHref = isDialog ? dialogHref(data.table, st, 'create') : `/admin/${data.table}/new`
const viewHref = (id) => (isDialog ? dialogHref(data.table, st, 'view', id) : `/admin/${data.table}/${encodeURIComponent(String(id))}`)
const editHref = (id) => (isDialog ? dialogHref(data.table, st, 'edit', id) : `/admin/${data.table}/${encodeURIComponent(String(id))}/edit`)
const closeHref = listUrl(data.table, st) // the list, minus any dialog param

// Per-row permission (#581): the data hook stamped `_canView` / `_canEdit` / `_canDelete` on each
// row. A row links to its detail view when viewable; the actions column (Edit + Delete) shows only
// when at least one row is actionable, and each per-row callback gates its own cell.
const anyView = data.rows.some((r) => r._canView)
const anyActions = data.rows.some((r) => r._canEdit || r._canDelete)

// The write path (Delete, and the edit form's POST) is always the row's edit route, unchanged by mode.
const deleteAction = (row) => `/admin/${data.table}/${encodeURIComponent(String(row[data.pk]))}/edit`

// ListView's function props: a sortable header links to the same list sorted by its column; a row
// links to its detail view (or view dialog) when the user may view that row.
const sortHref = (name, nextDir) => listUrl(data.table, { page: 1, sort: name, dir: nextDir })
const rowHref = anyView ? (row) => (row._canView ? viewHref(row[data.pk]) : undefined) : undefined

// The per-row action cell: an Edit link and/or a Delete control, each shown only when this user may
// perform it. Both target the row's EDIT route (where the update/delete hook lives). The Delete
// control is vike-blocks' `confirm` block guarding a no-JS form that POSTs `_action=delete`; keyed
// server-side on the primary key AND the resource scope, so a scoped user can only delete their own.
const linkStyle = { color: 'var(--color-primary, #2563eb)', textDecoration: 'none', fontSize: '14px' }
const rowActions = anyActions
  ? (row) =>
      h('span', { style: { display: 'inline-flex', gap: '0.9rem', alignItems: 'center' } }, [
        row._canEdit ? h('a', { href: editHref(row[data.pk]), style: linkStyle }, 'Edit') : null,
        row._canDelete
          ? h(ConfirmView, {
              label: 'Delete',
              link: true,
              intent: 'danger',
              title: 'Delete this row?',
              description: 'This cannot be undone.',
              confirmLabel: 'Delete',
              action: { to: deleteAction(row), method: 'post' },
              fields: [{ name: '_action', value: 'delete' }],
            })
          : null,
      ])
  : undefined
</script>
<template>
  <div :style="{ maxWidth: '900px', margin: '0 auto' }">
    <div :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md, 1rem)' }">
      <h1 :style="{ margin: 0, fontSize: '22px' }">{{ data.label }}</h1>
      <a v-if="data.canCreate" :href="newHref" :style="{ background: 'var(--color-primary)', color: 'var(--color-primary-text, #fff)', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius, 8px)', textDecoration: 'none', fontSize: '14px' }">+ New</a>
    </div>
    <div :style="{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius, 10px)', overflowX: 'auto', background: 'var(--color-surface)' }">
      <ListView
        :table="data.table"
        :columns="data.columns"
        :rows="data.rows"
        :pk="data.pk"
        :fkLabels="data.fkLabels"
        :sort="data.sort"
        :dir="data.dir"
        :sortHref="sortHref"
        :rowHref="rowHref"
        :rowActions="rowActions"
        row-action-label="View"
        empty-label="No rows found."
      />
    </div>
    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginTop: 'var(--space-md, 1rem)', fontSize: '14px', color: 'var(--color-muted)' }">
      <span>{{ data.total === 0 ? 'No rows' : `Page ${data.page} of ${data.pageCount} · ${data.total} ${data.total === 1 ? 'row' : 'rows'}` }}</span>
      <PaginationView :page="data.page" :pageCount="data.pageCount" :href="(p) => listUrl(data.table, { page: p, sort: data.sort, dir: data.dir })" />
    </div>

    <!-- Dialog mode (#598): the overlay is portalled, so it renders regardless of position. `dialog`
         is the URL-active screen the hook hydrated (or null = closed); Edit inside a view dialog
         switches to the edit dialog for the same row. The host is vike-crud's one CrudDialog (#728);
         admin themes it - heading via `titles`, write forms POST to the /admin/:table sub-routes via `submit`. -->
    <CrudDialog
      v-if="isDialog"
      :dialog="data.dialog"
      :table="data.table"
      :titles="dialogTitles(data.label)"
      :closeHref="closeHref"
      :editHref="data.dialog?.id != null ? editHref(data.dialog.id) : null"
      :submit="adminSubmit(data.table, data.dialog?.id)"
    />
  </div>
</template>
