// The admin's server hooks — Vike `data` hooks (server-env), one per page. They are the
// only place the admin touches the request: each resolves the merged schema + the
// contributed resources from `pageContext.config`, builds a universal-orm repository,
// and returns a PLAIN, serializable view-model the React page renders via useData().
// No ORM is imported; no SQL is written. The create hook also OWNS its POST: the request
// is surfaced to the hook (as a Web Request on server adapters, the raw Node request under
// `vite dev` — normalized by ./request.js), so the same route renders the form (GET) and
// performs the insert (POST). No separate endpoint, and no middleware that can't see the
// composed schema.
import { randomUUID } from 'node:crypto'
import { redirect } from 'vike/abort'
import { isInCondition } from '@universal-orm/core'
import { readFormRequest } from 'vike-crud/request'
// Shared, framework-agnostic helpers reused from vike-crud's data layer instead of a parallel copy:
// the primary-key resolver and the form-row coercion (its widget-aware superset of what admin had).
import { primaryKeyOf, rowFromForm } from 'vike-crud/data'
import { runQuery, allow, keepVisible } from 'vike-crud/authz'
import { parseListQuery, QueryError } from './query.js'
import { projectRow } from './project.js'
import {
  resolveAdminTables,
  getResources,
  findResource,
  tableNamed,
  resourceLabel,
  recordTitleColumn,
  buildDb,
  viewColumns,
  viewRecord,
  viewFields,
} from './resolve.js'

// The request-scoped auth context every resource predicate is evaluated against. `query(q, ctx)`,
// `onCreate(ctx)` and the `canX` gates all read `ctx.user`; kept server-side (never serialized).
const ctxOf = (pageContext) => ({ user: pageContext.user })

// Read the rows of a foreign-key TARGET table that the user is allowed to see, together
// with the column its rows are labelled by. The single place the FK scope (#141) is
// enforced: the lookup is bounded by the TARGET resource's own `scope(user)` — the same
// filter that bounds its own list — so a scoped user can only ever surface rows they would
// be allowed to see in the referenced table, never the whole table. A target with no
// registered resource or no scope is unbounded (the original behaviour), so this is purely
// additive. Returns null when the referenced table isn't in the schema (no lookup possible).
async function scopedFkRows(ref, { db, config, tables, ctx }) {
  const targetTable = tableNamed(tables, ref.table)
  if (!targetTable) return null
  const targetResource = findResource(config, ref.table)
  const titleCol = recordTitleColumn(targetResource, targetTable)
  const rows = await db[ref.table].find(queryFilter(targetResource, ctx))
  return { rows, titleCol }
}

// Fill the `options` of every foreign-key field by reading the referenced table: each
// row becomes `{ value: <ref column>, label: <recordTitle of the target> }`. The target's
// label column comes from its resource's `recordTitle` (else a schema default), so a
// `user_id` field shows users by email instead of by uuid. Plain + serializable. Bounded
// by the target's scope via scopedFkRows (#141).
async function loadFkOptions(fields, deps) {
  return Promise.all(
    fields.map(async (f) => {
      if (!f.fk) return f
      const lookup = await scopedFkRows(f.fk, deps)
      if (!lookup) return f
      const options = lookup.rows.map((r) => ({ value: r[f.fk.column], label: String(r[lookup.titleCol] ?? r[f.fk.column]) }))
      return { ...f, options }
    }),
  )
}

// For the list: a per-column map of FK value -> human title, so a FK cell shows the
// referenced row's title instead of the raw key. Only the list's foreign-key columns get
// an entry; everything else renders as-is. Like loadFkOptions, the lookup is bounded by the
// target resource's own `scope(user)` via scopedFkRows (#141), so the title map never
// serializes rows of the referenced table the user could not otherwise see (an in-scope FK
// value with no matching in-scope target row simply falls back to rendering the raw key).
async function fkLabelsFor(columns, schemaTable, deps) {
  const byName = new Map(schemaTable.columns.map((c) => [c.name, c]))
  const labels = {}
  for (const col of columns) {
    const ref = byName.get(col.name)?.references
    if (!ref) continue
    const lookup = await scopedFkRows(ref, deps)
    if (!lookup) continue
    labels[col.name] = Object.fromEntries(
      lookup.rows.map((r) => [r[ref.column], String(r[lookup.titleCol] ?? r[ref.column])]),
    )
  }
  return labels
}


// Row-level scoping (#104, #581). A resource declares `query(q, ctx) -> q` — a query-builder
// callback that reads like a query but only expresses what the ORM can execute (equality + `in`).
// The filter it builds is AND-merged into list/count/load/update/delete and FORCED onto inserts,
// so a non-admin only ever sees, edits, or creates their own rows. Returning the builder unrefined
// means "no scoping" (full access) — the admin bypass is encoded in the function, e.g.
// `(q, ctx) => (ctx.user.role === 'admin' ? q : q.where('user_id', ctx.user.id))`. A resource with
// no `query` is unscoped. `runQuery` (vike-crud) turns the callback into the universal-orm filter.
function queryFilter(resource, ctx) {
  return resource ? runQuery(resource.query, ctx) : {}
}

// Force a scope's scalar owner columns onto a row/patch, so a scoped user can neither create
// a row owned by someone else nor reassign ownership on edit (a forged `user_id` in the form
// is overwritten). Only scalar equalities are forced; an `in`-style scope has no single value
// to assign, so it bounds reads/edits but not writes. Returns the same object, mutated.
function applyScopeOwnership(obj, scope) {
  for (const [col, val] of Object.entries(scope)) {
    if (val !== null && typeof val !== 'object') {
      obj[col] = val // scalar scope: force the owner column
    } else if (isInCondition(val)) {
      // An `in`-style scope (e.g. `organization_id: { in: user.orgIds }`) has no single
      // value to force, but a submitted value MUST be inside the allowed set — otherwise a
      // scoped user could CREATE a row owned by, or REASSIGN a row to, a tenant they don't
      // belong to (the owner column is a writable form field). Reject a forged value;
      // absence is left to the column default.
      if (col in obj && obj[col] != null && !val.in.includes(obj[col])) {
        throw new QueryError(`scope: "${col}" must be one of the values you have access to`)
      }
    }
  }
  return obj
}

// Build a row from a JSON body (the agent API, #115). The twin of rowFromForm for typed
// JSON instead of string form fields: only the resource's DECLARED fields are written
// (an unknown key is ignored, never reaching the DB), and only keys PRESENT in the body
// (partial-update semantics — a PATCH that omits a column leaves it untouched, unlike the
// form where every field is submitted). Values arrive already typed; we still coerce a
// boolean leniently and an empty string to null so create matches the form's results.
function rowFromObject(fields, input = {}) {
  const byName = new Map(fields.map((f) => [f.name, f]))
  const row = {}
  for (const [key, raw] of Object.entries(input ?? {})) {
    const f = byName.get(key)
    if (!f) continue
    let value = raw
    if (f.type === 'boolean') value = value === true || value === 'true'
    else if (value === '') value = null
    else if (f.type === 'integer' && value != null) value = Number(value)
    row[key] = value
  }
  return row
}

// The insert orchestration shared by the create form POST and the agent API: fill a
// client-generatable (uuid/string) primary key the caller didn't supply, FORCE the scope's
// owner columns so a scoped user can only create rows they own (#104), then insert. Returns
// the inserted row. universal-orm rejects unknown columns, so a stray field is a clear error.
async function performInsert(db, table, row, { schemaTable, resource, ctx }) {
  const pk = schemaTable.columns.find((c) => c.primary)
  if (pk && row[pk.name] == null && (pk.type === 'uuid' || pk.type === 'string')) {
    row[pk.name] = randomUUID()
  }
  applyScopeOwnership(row, queryFilter(resource, ctx))
  // Write stamp (#581): `onCreate(ctx)` columns are forced onto the insert (e.g. `user_id`), so a
  // scoped user can't create a row owned by someone else even if `query` allowed a wider read.
  if (typeof resource?.onCreate === 'function') Object.assign(row, resource.onCreate(ctx) ?? {})
  await db[table].insert(row)
  return row
}

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
  const fkLabels = await fkLabelsFor(columns, schemaTable, { db, config: pageContext.config, tables, ctx })

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

  return {
    table,
    label: resourceLabel(resource),
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

// /admin/:table/new — renders the create form (GET) and performs the insert (POST). The
// POST reads the normalized form data (./request.js), coerces each value by its field
// type, fills a missing string/uuid primary key, inserts through universal-orm, and
// redirects back to the list. universal-orm rejects unknown columns, so a stray field is
// a clear error.
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

  // Agent API (#115): a create driven by a JSON body the middleware parsed and handed over
  // on `pageContext.adminApiWrite`. Same `canCreate` gate (above) and same insert + scope
  // ownership-forcing as the form POST below; returns the created row instead of redirecting.
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
    const row = rowFromForm(fields, await req.formData())
    await performInsert(db, table, row, { schemaTable, resource, ctx })
    throw redirect(`/admin/${table}`)
  }

  return {
    table,
    label: resourceLabel(resource),
    fields: await loadFkOptions(fields, { db, config: pageContext.config, tables, ctx }),
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

  const owned = { ...queryFilter(resource, ctx), [pk]: id }
  const row = await db[table].findOne(owned)
  // Deleted, never existed, not the user's, or not viewable by them -> back to the list.
  if (!row || !(await allow(resource.canView, row, ctx))) throw redirect(`/admin/${table}`)

  // Label FK values from the target table (bounded by its scope), then project to the visible
  // fields (+pk) before returning — the same leak guard as the list (#228). The `_label` keys are
  // added AFTER projection so the read-only cell can show the referenced row's title.
  const fkLabels = await fkLabelsFor(fields, schemaTable, { db, config: pageContext.config, tables, ctx })
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

  const withOptions = await loadFkOptions(fields, { db, config: pageContext.config, tables, ctx })
  // Project to the form fields (+pk) before returning, for the same reason as the list: the
  // raw row is serialized into the client payload and would otherwise leak hidden columns
  // (#228). The edit form only pre-fills `values[field.name]`.
  return { table, label: resourceLabel(resource), fields: withOptions, values: projectRow(values, { columns: fields, pk }), id, pk }
}
