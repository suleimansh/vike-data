// The admin's server hooks — Vike `data` hooks (server-env), one per page. They are the only place
// the admin touches the request: each resolves the merged schema + the contributed resources from
// `pageContext.config`, builds a universal-orm repository, and returns a PLAIN, serializable
// view-model the page renders via useData(). No ORM is imported; no SQL is written.
//
// Since #727 these are THIN WRAPPERS over vike-crud's one data layer: the FK enrichment (canIndex-
// gated, #676), the `in`-aware ownership forcing, the agent-API write helpers (rowFromObject /
// performInsert), and the dialog payload loader all live in `vike-crud/data`. The hooks here own
// only the admin route wiring, the paged list view-model, and the create/edit POST orchestration
// (which surfaces the request via vike-crud/request so the same route renders the form (GET) and
// performs the insert (POST) — no separate endpoint that can't see the composed schema).
import { redirect, render } from 'vike/abort'
import { readFormRequest, csrfRequestOf } from 'vike-crud/request'
import { csrfGuard } from 'vike-csrf'
// The shared data layer (#727): scoping, FK enrichment, the agent-API write helpers, the dialog loader.
import {
  primaryKeyOf,
  rowFromForm,
  rowFromObject,
  performInsert,
  applyScopeOwnership,
  queryFilter,
  loadFkOptions,
  fkLabelsFor,
  loadDialogPayload,
} from 'vike-crud/data'
import { allow, keepVisible } from 'vike-crud/authz'
import { parseListQuery, QueryError } from './query.js'
import { projectRow } from './project.js'
import {
  resolveAdminTables,
  getResources,
  findResource,
  tableNamed,
  resourceLabel,
  resourceMode,
  buildDb,
  viewColumns,
  viewRecord,
  viewFields,
} from './resolve.js'

// The request-scoped auth context every resource predicate is evaluated against. `query(q, ctx)`,
// `onCreate(ctx)` and the `canX` gates all read `ctx.user`; kept server-side (never serialized).
const ctxOf = (pageContext) => ({ user: pageContext.user })

// Resolve a table -> its registered resource, so the shared FK enrichment can gate on the TARGET
// resource's list access (#676). The admin's registry is the cumulative `adminResources` config.
const resolveResourceFor = (config) => (table) => findResource(config, table)

// /admin — the dashboard: the resources this install composed, filtered to the ones the signed-in
// user may list (`canIndex(ctx)`). Each card links to its list.
export async function dashboardData(pageContext) {
  const ctx = ctxOf(pageContext)
  const resources = getResources(pageContext.config)
  const visible = await Promise.all(resources.map((r) => allow(r.canIndex, ctx)))
  return {
    resources: resources
      .filter((_, i) => visible[i])
      .map((r) => ({ table: r.table, label: resourceLabel(r), icon: r.icon ?? null })),
  }
}

// The default rows-per-page for the admin list. Surfaced in the returned view-model
// (no silent cap) so the page can show an honest "Page X of Y".
const DEFAULT_PAGE_SIZE = 20

// /admin/:table — the list, PAGED, SORTED and optionally FILTERED. Reads either:
//   - the discrete params the list UI uses: `?page=` (1-based), `?sort=` (a sortable
//     column), `?dir=` (asc|desc); or
//   - a single `?query=` (URL-encoded JSON: filter / orderBy / limit / offset), the
//     narrow universal-orm surface (#86) the agent API (#113) speaks. It is parsed +
//     VALIDATED against this resource's columns (query.js); an unknown column / operator
//     is a 400, never a silent or SQL-smuggling read.
// Either way the caller's filter is AND-merged UNDER the row scope (#104) so it can only
// NARROW the result, never widen past what the user is allowed to see. Asks universal-orm
// for the total count and just that window of rows, then returns the page/sort state the
// list UI needs. Unknown / unviewable tables bounce to the dashboard.
export async function listData(pageContext) {
  const { table } = pageContext.routeParams
  const ctx = ctxOf(pageContext)
  const resource = findResource(pageContext.config, table)
  if (!resource || !(await allow(resource.canIndex, ctx))) throw redirect('/admin')

  const tables = resolveAdminTables(pageContext.config)
  const schemaTable = tableNamed(tables, table)
  if (!schemaTable) throw redirect('/admin')

  // Drop any `.when(ctx)`-hidden columns (#581) before reading, so a hidden column and the row
  // data projected against it never reach the client.
  const columns = keepVisible(viewColumns(resource, schemaTable), ctx)
  const pk = primaryKeyOf(schemaTable)
  const db = buildDb(tables)
  const resolveResource = resolveResourceFor(pageContext.config)

  const search = pageContext.urlParsed?.search ?? {}

  // Parse + validate the caller's `?query=` (filter / orderBy / limit / offset) against
  // this resource's columns. A bad query is the caller's fault: record it on pageContext so
  // the agent API (#113) returns a 400 with the message, and fall back to an empty query so
  // the HTML list still renders its scope-only view. (We avoid render(400): Vike recommends
  // against a 400 status there, and it would need an error page just for the JSON path.)
  let query
  try {
    query = parseListQuery(search.query, columns)
  } catch (err) {
    if (!(err instanceof QueryError)) throw err
    pageContext.adminApiError = err.message
    query = { filter: {} }
  }

  // Row scoping: AND-merge the query filter LAST so it always wins — the caller's filter
  // can add conditions but can never override a scoped column (#104). Empty when the
  // resource is unscoped (admin / no query).
  const scope = queryFilter(resource, ctx)
  const where = { ...query.filter, ...scope }

  // Sort: a validated `?query=` orderBy wins; otherwise the discrete `?sort=`/`?dir=`,
  // honouring only a column the resource marked `sortable`.
  const sortable = new Set(columns.filter((c) => c.sortable).map((c) => c.name))
  const discreteSort = sortable.has(search.sort) ? search.sort : null
  const orderBy = query.orderBy ?? (discreteSort ? [{ column: discreteSort, dir: search.dir === 'desc' ? 'desc' : 'asc' }] : undefined)
  const sort = orderBy?.[0]?.column ?? null
  const dir = orderBy?.[0]?.dir ?? 'asc'

  const total = await db[table].count(where)

  // Window: an explicit `?query=` limit/offset (agent style) is used verbatim; otherwise
  // the list UI's page model. Page/pageCount are derived for the returned view-model so
  // the UI can show an honest "Page X of Y" in both modes.
  let pageSize, offset
  if (query.limit != null) {
    pageSize = query.limit
    offset = query.offset ?? 0
  } else {
    pageSize = DEFAULT_PAGE_SIZE
    const pageCountForClamp = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(Math.max(1, Number(search.page) || 1), pageCountForClamp)
    offset = (page - 1) * pageSize
  }
  // `?query={"limit":0}` is a valid "count only, no rows" request, but dividing by a zero
  // page size would yield Infinity/NaN in the response. Treat it as a single empty page.
  const pageCount = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1
  const page = pageSize > 0 ? Math.min(Math.floor(offset / pageSize) + 1, pageCount) : 1

  const rows = await db[table].find(where, { limit: pageSize, offset, orderBy })
  const fkLabels = await fkLabelsFor(columns, schemaTable, { db, tables, ctx, resolveResource }, rows)

  // Per-row permission (#581): `canView`/`canEdit`/`canDelete` are record-level `(record, ctx)`,
  // evaluated here on the server (predicates never serialize) and stamped onto each projected row
  // so the list links to the detail page / shows an Edit link / Delete control only for the rows
  // this user may act on.
  const projected = await Promise.all(
    rows.map(async (row) => ({
      ...projectRow(row, { columns, pk }),
      _canView: await allow(resource.canView, row, ctx),
      _canEdit: await allow(resource.canEdit, row, ctx),
      _canDelete: await allow(resource.canDelete, row, ctx),
    })),
  )

  // Dialog mode (#596): a `mode: 'dialog'` resource hosts view/create/edit as an overlay on THIS
  // route. Hydrate the active dialog (if the URL asks for one) so it survives a refresh; `mode` tells
  // the list renderer to point its links at `?view=/?edit=/?create` instead of the sub-routes. Both
  // renderers host the overlay through vike-crud's one CrudDialog (#728). Route resources
  // compute nothing here. The loader is vike-crud's, shared with a per-page dialog resource (#727).
  const mode = resourceMode(resource)
  const dialog = mode === 'dialog' ? await loadDialogPayload({ resource, table, tables, schemaTable, db, ctx, search, resolveResource }) : null

  return {
    table,
    label: resourceLabel(resource),
    mode, // 'route' | 'dialog' - drives the list's link targets and the overlay
    dialog, // the hydrated active dialog ({ screen, ... }) or null
    columns,
    // Project to the visible columns (+pk) BEFORE returning: vike-react serializes this straight
    // into the client payload, so a raw row would ship every hidden column (a password_hash, an
    // unlisted secret) to the browser — the same leak the JSON API's projectRow guards against
    // (#228). The list only renders these columns, `row[pk]`, and the per-row `_canEdit`/`_canDelete`.
    rows: projected,
    fkLabels, // { column -> { value -> title } } so FK cells show the referenced row's title
    pk, // the row identity the Edit links key on
    canCreate: await allow(resource.canCreate, ctx), // gates the "New" button
    // paging + sort state for the list UI
    page,
    pageCount,
    pageSize,
    total,
    sort, // active sort column, or null
    dir, // 'asc' | 'desc'
  }
}

// /admin/:table/new — renders the create form (GET) and performs the insert (POST). The POST reads
// the normalized form data (vike-crud/request), coerces each value by its field type, fills a
// missing string/uuid primary key, inserts through universal-orm, and redirects back to the list.
export async function newData(pageContext) {
  const { table } = pageContext.routeParams
  const ctx = ctxOf(pageContext)
  const resource = findResource(pageContext.config, table)
  if (!resource || !(await allow(resource.canCreate, ctx))) throw redirect('/admin')

  const tables = resolveAdminTables(pageContext.config)
  const schemaTable = tableNamed(tables, table)
  if (!schemaTable) throw redirect('/admin')

  // Drop `.when(ctx)`-hidden fields (#581): a hidden field is neither rendered nor writable, so a
  // forged hidden field in the body is ignored (it isn't in the coercion set).
  const fields = keepVisible(viewFields(resource, schemaTable), ctx)
  const db = buildDb(tables)
  const resolveResource = resolveResourceFor(pageContext.config)

  // Agent API (#115): a create driven by a JSON body the middleware parsed and handed over on
  // `pageContext.adminApiWrite`. Same `canCreate` gate (above) and same insert + scope
  // ownership-forcing (performInsert) as the form POST below; returns the created row.
  if (pageContext.adminApiWrite) {
    try {
      const row = rowFromObject(fields, pageContext.adminApiWrite.input)
      const created = await performInsert(db, table, row, { schemaTable, resource, ctx })
      return { apiWrite: { created }, columns: viewColumns(resource, schemaTable), pk: primaryKeyOf(schemaTable) }
    } catch (err) {
      pageContext.adminApiError = err.message
      return {}
    }
  }

  const req = readFormRequest(pageContext)
  if (req.method === 'POST') {
    // CSRF (#702): a cross-site page can forge this form POST; verify before reading the body.
    const surfaced = csrfRequestOf(pageContext)
    if (surfaced && csrfGuard(surfaced)) throw render(403)
    const row = rowFromForm(fields, await req.formData())
    await performInsert(db, table, row, { schemaTable, resource, ctx })
    throw redirect(`/admin/${table}`)
  }

  return {
    table,
    label: resourceLabel(resource),
    fields: await loadFkOptions(fields, { db, tables, ctx, resolveResource }),
  }
}

// /admin/:table/:id — the read-only VIEW (detail) page. Loads the one row keyed on its primary
// key AND the query scope, gates it with `canView(record, ctx)`, and returns the resolved RECORD
// fields + values for the read-only display. FK values are labelled from the target table (bounded
// by its own scope) so the detail shows an author's email, not a uuid. A missing / out-of-scope /
// unviewable row bounces to the list. `canEdit`/`canDelete` ride along so the page can offer the
// Edit / Delete controls only when this user may act on the row.
export async function viewData(pageContext) {
  const { table, id } = pageContext.routeParams
  const ctx = ctxOf(pageContext)
  const resource = findResource(pageContext.config, table)
  if (!resource) throw redirect('/admin')

  const tables = resolveAdminTables(pageContext.config)
  const schemaTable = tableNamed(tables, table)
  if (!schemaTable) throw redirect('/admin')

  const fields = keepVisible(viewRecord(resource, schemaTable), ctx)
  const pk = primaryKeyOf(schemaTable)
  const db = buildDb(tables)
  const resolveResource = resolveResourceFor(pageContext.config)

  const owned = { ...queryFilter(resource, ctx), [pk]: id }
  const row = await db[table].findOne(owned)
  // Deleted, never existed, not the user's, or not viewable by them -> back to the list.
  if (!row || !(await allow(resource.canView, row, ctx))) throw redirect(`/admin/${table}`)

  // Label FK values from the target table (bounded by its scope), then project to the visible
  // fields (+pk) before returning — the same leak guard as the list (#228). The `_label` keys are
  // added AFTER projection so the read-only cell can show the referenced row's title.
  const fkLabels = await fkLabelsFor(fields, schemaTable, { db, tables, ctx, resolveResource }, [row])
  const values = projectRow(row, { columns: fields, pk })
  for (const [col, map] of Object.entries(fkLabels)) {
    if (values[col] != null && map[values[col]] != null) values[`${col}_label`] = map[values[col]]
  }

  return {
    table,
    label: resourceLabel(resource),
    fields,
    values,
    id,
    pk,
    canEdit: await allow(resource.canEdit, row, ctx),
    canDelete: await allow(resource.canDelete, row, ctx),
  }
}

// /admin/:table/:id/edit — the detail/edit page. GET loads the row by its primary key and
// pre-fills the form; POST either UPDATES it (default) or DELETES it (an `_action=delete`
// field, from the Delete control), then redirects to the list. The row is loaded FIRST, then
// the record-level gate runs against it (`canEdit(record, ctx)` / `canDelete(record, ctx)`); an
// unknown id, an out-of-scope row, or a denied gate all bounce back to the list. The static
// `/new` route keeps precedence over this `@id` param, so creating never collides with editing.
export async function editData(pageContext) {
  const { table, id } = pageContext.routeParams
  const ctx = ctxOf(pageContext)
  const resource = findResource(pageContext.config, table)
  if (!resource) throw redirect('/admin')

  const tables = resolveAdminTables(pageContext.config)
  const schemaTable = tableNamed(tables, table)
  if (!schemaTable) throw redirect('/admin')

  const fields = keepVisible(viewFields(resource, schemaTable), ctx)
  const pk = primaryKeyOf(schemaTable)
  const db = buildDb(tables)
  const resolveResource = resolveResourceFor(pageContext.config)

  // Row scoping (#104): every op keys on the primary key AND the query scope, so a scoped user
  // can only load / edit / delete a row they own — guessing another owner's id matches nothing.
  const scope = queryFilter(resource, ctx)
  const owned = { ...scope, [pk]: id }

  // Agent API (#115): an update or delete driven by the middleware. Loads the owned row first so
  // the record-level gate runs against it; an id-guess for another owner (or a denied gate) is a
  // `notFound` (never leaking existence). Returns the result instead of redirecting to the list.
  if (pageContext.adminApiWrite) {
    try {
      const { action, input } = pageContext.adminApiWrite
      const existing = await db[table].findOne(owned)
      if (action === 'delete') {
        if (!existing || !(await allow(resource.canDelete, existing, ctx))) return { apiWrite: { notFound: true } }
        await db[table].delete(owned)
        return { apiWrite: { deleted: true } }
      }
      if (!existing || !(await allow(resource.canEdit, existing, ctx))) return { apiWrite: { notFound: true } }
      // Re-assert ownership on the patch so the edit can't reassign the row to another owner.
      await db[table].update(owned, applyScopeOwnership(rowFromObject(fields, input), scope))
      const updated = await db[table].findOne(owned)
      return { apiWrite: { updated }, columns: viewColumns(resource, schemaTable), pk }
    } catch (err) {
      pageContext.adminApiError = err.message
      return {}
    }
  }

  const req = readFormRequest(pageContext)
  if (req.method === 'POST') {
    // CSRF (#702): a cross-site page can forge this form POST; verify before reading the body.
    const surfaced = csrfRequestOf(pageContext)
    if (surfaced && csrfGuard(surfaced)) throw render(403)
    const form = await req.formData()
    const existing = await db[table].findOne(owned)
    const isDelete = form.get('_action') === 'delete'
    // Load-then-gate: a missing/out-of-scope row or a denied record gate is a silent no-op that
    // bounces to the list (same outcome as guessing another owner's id).
    if (existing && (await allow(isDelete ? resource.canDelete : resource.canEdit, existing, ctx))) {
      if (isDelete) await db[table].delete(owned)
      // Re-assert ownership on the patch so the edit can't reassign the row to another owner.
      else await db[table].update(owned, applyScopeOwnership(rowFromForm(fields, form), scope))
    }
    throw redirect(`/admin/${table}`)
  }

  const values = await db[table].findOne(owned)
  // Deleted, never existed, not the user's, or not editable by them -> back to the list.
  if (!values || !(await allow(resource.canEdit, values, ctx))) throw redirect(`/admin/${table}`)

  const withOptions = await loadFkOptions(fields, { db, tables, ctx, resolveResource })
  // Project to the form fields (+pk) before returning, for the same reason as the list: the
  // raw row is serialized into the client payload and would otherwise leak hidden columns
  // (#228). The edit form only pre-fills `values[field.name]`.
  return { table, label: resourceLabel(resource), fields: withOptions, values: projectRow(values, { columns: fields, pk }), id, pk }
}
