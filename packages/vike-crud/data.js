// The framework-agnostic DATA layer — the server-side complement to resolveView. Where
// resolveView derives a view's STRUCTURE from the schema (columns / fields), this fills in the
// DATA each data-driven block needs before it reaches the client: a `list` block gets its paged,
// owner-scoped rows + FK labels; a `record` block gets its one row. It also owns the write path
// (create / update / delete), so a rendered form actually persists. Runs on the app's ORM
// repository (buildDb), so it works on the memory adapter (demo/tests) or a real database
// unchanged.
//
// This is the ONE data layer for both a per-page vike-crud resource and the vike-admin preset
// (#727). The FK enrichment, the agent-API write path, the `in`-aware ownership forcing, and the
// dialog payload loader all live here; vike-admin's page hooks are thin wrappers over them.
//
// ROW SCOPING (#104). Two shapes reach this layer:
//   - a RESOURCE carrying `query(q, ctx) -> q` (the authoring surface): its filter comes from
//     `runQuery` / `queryFilter`. This is what the admin hooks and viewData pass.
//   - a low-level `scope(table, ctx) -> filter` FUNCTION for the standalone / ejected tier (the
//     owner contract wires it, e.g. `(t) => ({ user_id: ctx.user.id })`).
// Either way the filter bounds every read AND is forced onto writes, so a scoped user only ever
// sees / edits / creates their own rows. Kept out of the serialized block (a scope function never
// serializes to the client).
//
// FK ENRICHMENT is bounded by the TARGET resource's list access (#141, #676) when a
// `resolveResource(table)` is supplied (admin + viewData): only a registered resource the user may
// `canIndex` is enumerable, under its own `query` scope, narrowed to the keys referenced on the
// page. Without a resolver (a bare `hydrateView`) the FK path is permissive — it labels the
// referenced target rows without a registry to gate against.
import { resolvePage } from 'vike-blocks'
import { projectRow } from './project.js'
import { tableNamed, recordTitleColumn, viewRecord, viewFields } from './resolve.js'
import { keepVisible, runQuery, allow } from './authz.js'
import { QueryError } from './query.js'
import { mapSections } from './walk.js'

const DEFAULT_PAGE_SIZE = 20

// An `{ in: [...] }` filter condition, the only non-scalar shape universal-orm's narrow surface
// emits (#44). Checked locally so this module stays isomorphic-safe (no @universal-orm/core import).
const isInCondition = (val) => val != null && typeof val === 'object' && Array.isArray(val.in)

// The Web Crypto UUID, not node:crypto's -- so this module stays isomorphic-safe. The root
// index.js re-exports this file, and a `data` hook (viewData) can be reached from the CLIENT bundle
// during client-side navigation; a hard `node:crypto` import breaks that build. `globalThis.crypto`
// is present in Node 18+ and every browser. Only the server-side write path actually calls it.
const randomUUID = () => globalThis.crypto.randomUUID()

export const primaryKeyOf = (schemaTable) => schemaTable?.columns.find((c) => c.primary)?.name ?? 'id'

function scopeFor(scope, table, ctx) {
  if (typeof scope !== 'function') return {}
  return scope(table, ctx) ?? {}
}

// The universal-orm filter a resource's `query(q, ctx)` builds (#104). Empty when the resource is
// unscoped (admin bypass / no `query`). The resource-authoring counterpart to `scopeFor`.
export function queryFilter(resource, ctx) {
  return resource ? runQuery(resource.query, ctx) : {}
}

// Force a scope filter's owner columns onto a row/patch so a scoped user can neither create a row
// owned by someone else nor reassign ownership on edit (a forged owner field is overwritten).
// Scalar equalities are forced. An `in`-style scope has no single value to assign, so it bounds
// reads but not writes — a submitted value MUST be inside the allowed set, else a scoped user could
// create/reassign a row into a tenant they don't belong to (the owner column is a writable field);
// a forged value is rejected, absence is left to the column default. Returns the same object,
// mutated.
export function applyScopeOwnership(obj, scopeFilter) {
  for (const [col, val] of Object.entries(scopeFilter)) {
    if (val !== null && typeof val !== 'object') {
      obj[col] = val
    } else if (isInCondition(val)) {
      if (col in obj && obj[col] != null && !val.in.includes(obj[col])) {
        throw new QueryError(`scope: "${col}" must be one of the values you have access to`)
      }
    }
  }
  return obj
}

// Read the rows of a foreign-key TARGET table the user may see, with the column its rows are
// labelled by. The single place the FK scope (#141, #676) is enforced. When `resolveResource` is
// supplied, FK enrichment MIRRORS the user's list access to the target: only a registered resource
// the user may `canIndex` is read, bounded by that resource's own `query` scope — the exact gate the
// list uses — so a user can never surface, through a FK dropdown or label map, a row they could not
// see by visiting the target's own list. A target that is NOT a registered, indexable resource
// yields no rows (raw keys render instead). Without a resolver the read is permissive (no registry
// to gate against). `values`, when given, narrows the read to just the referenced keys, so the
// serialized map carries no unreferenced target row; omit it for the form picker, which enumerates
// the in-scope target to populate its options. Returns null when the target isn't in the schema.
async function scopedFkRows(ref, { db, tables, ctx, resolveResource }, values) {
  const targetTable = tableNamed(tables, ref.table)
  if (!targetTable) return null
  const targetResource = resolveResource ? resolveResource(ref.table) : null
  const titleCol = recordTitleColumn(targetResource, targetTable)
  // Deny by default WHEN gating: with a resolver, only a registered resource the user may list is
  // enumerable (#676). Without a resolver (bare hydrateView) the FK path stays permissive.
  if (resolveResource && (!targetResource || !(await allow(targetResource.canIndex, ctx)))) return { rows: [], titleCol }
  const scope = queryFilter(targetResource, ctx)
  const rows = await db[ref.table].find(scope)
  if (values) {
    // Label path: keep only the scope-visible target rows actually referenced on this page, so the
    // serialized map carries no unreferenced target row. Filtered in JS (not a merged `in`) because
    // the scope may already constrain `ref.column` — a merge would clobber it and re-widen (#676).
    const keys = new Set(values.filter((v) => v != null))
    return { rows: rows.filter((r) => keys.has(r[ref.column])), titleCol }
  }
  return { rows, titleCol }
}

// Fill the `options` of every foreign-key field by reading the referenced table: each row becomes
// `{ value: <ref column>, label: <recordTitle of the target> }`, so a `user_id` field shows users
// by email instead of by uuid. Bounded by the target's list access via scopedFkRows (#141, #676) —
// a FK whose target is not a registered, indexable resource gets no options (a raw key input).
export async function loadFkOptions(fields, deps) {
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

// For the list/view: a per-column map of FK value -> human title, so a FK cell shows the referenced
// row's title instead of the raw key. Only the given `rows`' foreign-key columns get an entry. The
// lookup is bounded by the target's list access AND to the FK values present in `rows` via
// scopedFkRows (#141, #676), so the title map never serializes a target row the user could not see,
// nor one not referenced on this page.
export async function fkLabelsFor(columns, schemaTable, deps, rows) {
  const byName = new Map(schemaTable.columns.map((c) => [c.name, c]))
  const labels = {}
  for (const col of columns) {
    const ref = byName.get(col.name)?.references
    if (!ref) continue
    const lookup = await scopedFkRows(ref, deps, rows.map((r) => r[col.name]))
    if (!lookup) continue
    labels[col.name] = Object.fromEntries(lookup.rows.map((r) => [r[ref.column], String(r[lookup.titleCol] ?? r[ref.column])]))
  }
  return labels
}

// Build a row from a JSON body (the agent API, #115). The twin of rowFromForm for typed JSON
// instead of string form fields: only the resource's DECLARED fields are written (an unknown key is
// ignored, never reaching the DB), and only keys PRESENT in the body (partial-update semantics — a
// PATCH that omits a column leaves it untouched). Values arrive typed; we still coerce a boolean
// leniently and an empty string to null so create matches the form's results.
export function rowFromObject(fields, input = {}) {
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
// client-generatable (uuid/string) primary key the caller didn't supply, FORCE the resource's scope
// owner columns so a scoped user can only create rows they own (#104), stamp `onCreate(ctx)`, then
// insert. Returns the inserted row. universal-orm rejects unknown columns, so a stray field errors.
export async function performInsert(db, table, row, { schemaTable, resource, ctx }) {
  const pk = schemaTable.columns.find((c) => c.primary)
  if (pk && row[pk.name] == null && (pk.type === 'uuid' || pk.type === 'string')) {
    row[pk.name] = randomUUID()
  }
  applyScopeOwnership(row, queryFilter(resource, ctx))
  if (typeof resource?.onCreate === 'function') Object.assign(row, resource.onCreate(ctx) ?? {})
  await db[table].insert(row)
  return row
}

async function hydrateList(section, opts) {
  const { db, tables, scope, ctx, search = {} } = opts
  const { table, columns } = section.resolved
  const schemaTable = tableNamed(tables, table)
  const pk = primaryKeyOf(schemaTable)

  const sortable = new Set(columns.filter((c) => c.sortable).map((c) => c.name))
  const sort = sortable.has(search.sort) ? search.sort : null
  const dir = search.dir === 'desc' ? 'desc' : 'asc'
  const orderBy = sort ? [{ column: sort, dir }] : undefined

  const where = scopeFor(scope, table, ctx)
  const total = await db[table].count(where)
  const pageSize = DEFAULT_PAGE_SIZE
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const page = Math.min(Math.max(1, Number(search.page) || 1), pageCount)
  const offset = (page - 1) * pageSize

  const rows = await db[table].find(where, { limit: pageSize, offset, orderBy })
  const fkLabels = await fkLabelsFor(columns, schemaTable, { db, tables, ctx, resolveResource: opts.resolveResource }, rows)
  // Project to the visible columns (+pk) so a hidden column never ships to the client (#228).
  const projected = rows.map((r) => projectRow(r, { columns, pk }))

  return { ...section, resolved: { ...section.resolved, rows: projected, fkLabels, pk, page, pageCount, total, sort, dir } }
}

// The record (detail) block's one row, keyed on the primary key AND the scope so a scoped user can
// only ever load a row they own. The id comes from the block descriptor (`section.props.id`) or,
// for a route-driven detail page (`/posts/@id`), the route param passed through as `opts.id`.
// Whether the request's `id` targets THIS section. On a single-screen route page (no
// `activeScreen` passed) the id always applies (the #577 behavior). On a dialog-mode index page
// several record/form sections coexist, so the id only applies to the one whose screen the URL
// activated (`?view=` -> the view section, `?edit=` -> the edit section) — the rest stay blank.
function idForSection(section, opts) {
  const gated = opts.activeScreen !== undefined && section.props.screen != null
  const targeted = !gated || section.props.screen === opts.activeScreen
  return section.props.id ?? (targeted ? (opts.id ?? null) : null)
}

async function hydrateRecord(section, opts) {
  const { db, tables, scope, ctx } = opts
  const { table, fields } = section.resolved
  const schemaTable = tableNamed(tables, table)
  const pk = primaryKeyOf(schemaTable)
  const id = idForSection(section, opts)
  if (id == null) return { ...section, resolved: { ...section.resolved, row: null, pk } }
  const owned = { ...scopeFor(scope, table, ctx), [pk]: id }
  const row = await db[table].findOne(owned)
  // FK label map ({ field: { value: label } }), same shape the list block uses, so a record view shows
  // the referenced row's title instead of the raw key. Only computed when there's a row to label.
  const fkLabels = row ? await fkLabelsFor(fields, schemaTable, { db, tables, ctx, resolveResource: opts.resolveResource }, [row]) : {}
  return { ...section, resolved: { ...section.resolved, row: row ? projectRow(row, { columns: fields, pk }) : null, fkLabels, pk } }
}

// The form block's pre-fill values. With an id (the edit screen) it loads the owned row and fills
// the form; without one (the create screen) it stays blank. Same primary-key-AND-scope key as the
// record block, so an edit form can only ever pre-fill a row the user owns (an id-guess for
// another owner yields `values: null`, which the caller turns into a 404).
async function hydrateForm(section, opts) {
  const { db, tables, scope, ctx } = opts
  const { table, fields } = section.resolved
  const schemaTable = tableNamed(tables, table)
  const pk = primaryKeyOf(schemaTable)
  const id = idForSection(section, opts)
  if (id == null) return { ...section, resolved: { ...section.resolved, values: {}, pk } }
  const owned = { ...scopeFor(scope, table, ctx), [pk]: id }
  const row = await db[table].findOne(owned)
  return { ...section, resolved: { ...section.resolved, values: row ? projectRow(row, { columns: fields, pk }) : null, pk, id } }
}

// Apply per-field `.when(ctx)` visibility (#581): drop the hidden list columns / record + form
// fields and strip the predicate, so hidden columns (and the row data projected against them)
// never reach the client. Runs before hydration so the projection only ever sees visible columns.
function applyVisibility(section, ctx) {
  const r = section?.resolved
  if (!r) return section
  const resolved = { ...r }
  if (Array.isArray(r.columns)) resolved.columns = keepVisible(r.columns, ctx)
  if (Array.isArray(r.fields)) resolved.fields = keepVisible(r.fields, ctx)
  return { ...section, resolved }
}

// Resolve a view AND fill in the data its blocks need. Returns hydrated sections a renderer
// draws directly (`{ block, props, resolved }`, with `resolved.rows` / `resolved.row` filled).
// `opts.resolveResource(table)` (optional) gates FK enrichment on the target's list access (#676).
export async function hydrateView(view, opts = {}) {
  const resolved = resolvePage(view, opts.tables)
  // Hydrate every data block WHEREVER it sits — a list / record / form nested in a card / tab /
  // field is filled too (#574), so a composed view hydrates the same as a flat one. mapSections
  // descends into containers and rebuilds them around the hydrated children.
  const sections = await mapSections(resolved.sections, (s0) => {
    const s = applyVisibility(s0, opts.ctx)
    return s.block === 'list' ? hydrateList(s, opts) : s.block === 'record' ? hydrateRecord(s, opts) : s.block === 'form' ? hydrateForm(s, opts) : s
  })
  return { route: resolved.route, sections }
}

// Load one row keyed on the primary key AND the scope (the owner contract). Returns the row or
// null (never existed, or not the user's). The single lookup the can* record gates check against
// before an update/delete, so a predicate only ever sees an in-scope row.
export function loadOwnedRow(db, tables, table, id, { scope, ctx } = {}) {
  const pk = primaryKeyOf(tableNamed(tables, table))
  return db[table].findOne({ ...scopeFor(scope, table, ctx), [pk]: id })
}

// Build a row from submitted form data, coercing each field by its type. An unchecked checkbox
// sends no value (boolean reads false on absence); an empty string becomes null; an integer is
// numeric. `form` is a FormData / URLSearchParams-shaped object (`.get` / `.has`).
export function rowFromForm(fields, form) {
  const row = {}
  for (const f of fields) {
    if (f.type === 'boolean' || f.widget === 'boolean') {
      row[f.name] = form.get(f.name) === 'on' || form.get(f.name) === 'true'
      continue
    }
    if (!form.has(f.name)) continue
    let value = form.get(f.name)
    if (value === '') value = null
    else if (f.type === 'integer' || f.widget === 'integer') value = value == null ? value : Number(value)
    row[f.name] = value
  }
  return row
}

// Insert a row from a submitted form: coerce, fill a client-generatable (uuid/string) primary
// key, FORCE the scope's owner columns, insert. Returns the inserted row.
export async function createRow(db, tables, table, fields, form, { scope, ctx, onCreate } = {}) {
  const schemaTable = tableNamed(tables, table)
  const row = rowFromForm(fields, form)
  const pk = schemaTable?.columns.find((c) => c.primary)
  if (pk && row[pk.name] == null && (pk.type === 'uuid' || pk.type === 'string')) row[pk.name] = randomUUID()
  applyScopeOwnership(row, scopeFor(scope, table, ctx))
  // The write stamp (#581): force the resource's `onCreate(ctx)` columns onto the insert (e.g.
  // `user_id`), so a scoped user can't create a row owned by someone else even if `query` (read
  // scope) allowed everything. Overrides any client-forged value for those columns.
  if (typeof onCreate === 'function') Object.assign(row, onCreate(ctx) ?? {})
  await db[table].insert(row)
  return row
}

// Update a row by its primary key AND the scope, so a scoped user can only edit a row they own
// (an id-guess for another owner matches nothing). Re-forces ownership so an edit can't reassign
// the row. Returns the updated row, or null when nothing matched.
export async function updateRow(db, tables, table, fields, id, form, { scope, ctx } = {}) {
  const schemaTable = tableNamed(tables, table)
  const pk = primaryKeyOf(schemaTable)
  const sc = scopeFor(scope, table, ctx)
  const owned = { ...sc, [pk]: id }
  const patch = applyScopeOwnership(rowFromForm(fields, form), sc)
  await db[table].update(owned, patch)
  return db[table].findOne(owned)
}

// Delete a row by its primary key AND the scope. Returns the number of rows deleted (0 when the
// row isn't the user's).
export function deleteRow(db, tables, table, id, { scope, ctx } = {}) {
  const schemaTable = tableNamed(tables, table)
  const pk = primaryKeyOf(schemaTable)
  const owned = { ...scopeFor(scope, table, ctx), [pk]: id }
  return db[table].delete(owned)
}

// Dialog mode (#596): on a `mode: 'dialog'` resource the LIST route hosts view / create / edit as an
// overlay opened by a URL param (`?view=id` / `?edit=id` / `?create`). This hydrates the ACTIVE
// dialog's payload on the list request so it survives refresh / share, reusing the same resolve
// helpers + record-level gates as the standalone pages. Precedence is view > edit > create (a stray
// second param can't open two). The dialog's create/edit FORMS post to the existing routes, so there
// is no new write path here — only this read. Returns null when no dialog param is set, or the
// target row is missing / out of scope / not permitted (a stale param renders no dialog). `resource`
// carries the `query` scope + `canX` gates; `resolveResource` gates FK enrichment on the payload.
export async function loadDialogPayload({ resource, table, tables, schemaTable, db, ctx, search, resolveResource }) {
  const pk = primaryKeyOf(schemaTable)
  const deps = { db, tables, ctx, resolveResource }

  if (search.view != null) {
    const id = String(search.view)
    const fields = keepVisible(viewRecord(resource, schemaTable), ctx)
    const row = await db[table].findOne({ ...queryFilter(resource, ctx), [pk]: id })
    if (!row || !(await allow(resource.canView, row, ctx))) return null
    const fkLabels = await fkLabelsFor(fields, schemaTable, deps, [row])
    const values = projectRow(row, { columns: fields, pk })
    for (const [col, map] of Object.entries(fkLabels)) {
      if (values[col] != null && map[values[col]] != null) values[`${col}_label`] = map[values[col]]
    }
    return { screen: 'view', id, fields, values, canEdit: await allow(resource.canEdit, row, ctx), canDelete: await allow(resource.canDelete, row, ctx) }
  }

  if (search.edit != null) {
    const id = String(search.edit)
    const fields = keepVisible(viewFields(resource, schemaTable), ctx)
    const row = await db[table].findOne({ ...queryFilter(resource, ctx), [pk]: id })
    if (!row || !(await allow(resource.canEdit, row, ctx))) return null
    return { screen: 'edit', id, fields: await loadFkOptions(fields, deps), values: projectRow(row, { columns: fields, pk }) }
  }

  if (search.create != null) {
    if (!(await allow(resource.canCreate, ctx))) return null
    const fields = keepVisible(viewFields(resource, schemaTable), ctx)
    return { screen: 'create', fields: await loadFkOptions(fields, deps) }
  }

  return null
}
