// The generic Vike DATA hook shared by every generated view page. It resolves which view + route
// params this pathname is (param routes like `/posts/@id` included), enforces the resource's
// authorization (row `query` scope, per-screen `can*` gate, per-field `.when` visibility), hydrates
// the view's blocks and returns the sections ViewPage renders. On POST it OWNS the write: create /
// update / delete through the scoped data layer, keyed on the route `id`, then redirects to the
// resource's index. No separate endpoint — a plain SSR form post.
import { render, redirect } from 'vike/abort'
import { resolveViewTables, buildDb, hydrateView, createRow, updateRow, deleteRow, loadOwnedRow, queryScope, allow, keepVisible } from '../index.js'
import { resolveViewRequest, formFieldsFor } from './pages.js'
import { readFormRequest } from '../request.js'

export async function viewData(pageContext) {
  const config = pageContext.config
  const pathname = pageContext.urlPathname
  const match = resolveViewRequest(config?.views, pathname)
  if (!match) return { route: pathname, sections: [] }
  const { view, params } = match

  const tables = resolveViewTables(config)
  const db = buildDb(tables)
  const ctx = { user: pageContext.user }
  const id = params.id ?? null // a route param (the view / edit detail routes carry `@id`)
  const crud = view.crud ?? {} // defineCrud auth + meta; empty for a hand-written / legacy view
  // Row scope: a legacy view's `scope` (table, ctx) => filter, else the resource's `query` builder.
  const scope = view.scope ?? queryScope(crud.query)
  const base = crud.base ?? pathname // where a write redirects back to (the resource index)

  const req = readFormRequest(pageContext)
  if (req.method === 'POST') {
    const form = await req.formData()
    const table = form.get('_table') ?? crud.table ?? null
    // A `.when`-hidden field is not writable: drop it before coercing, so a forged hidden field
    // in the body is ignored (matching what the user was allowed to see/submit).
    const fields = table ? keepVisible(formFieldsFor(view, tables, table), ctx) : null
    if (table && fields) {
      const rid = id ?? form.get('_id')
      if (rid) {
        const current = await loadOwnedRow(db, tables, table, rid, { scope, ctx })
        if (current) {
          if (form.get('_action') === 'delete') {
            if (!(await allow(crud.canDelete, current, ctx))) throw render(403)
            await deleteRow(db, tables, table, rid, { scope, ctx })
          } else {
            if (!(await allow(crud.canEdit, current, ctx))) throw render(403)
            await updateRow(db, tables, table, fields, rid, form, { scope, ctx })
          }
        }
      } else {
        if (!(await allow(crud.canCreate, ctx))) throw render(403)
        await createRow(db, tables, table, fields, form, { scope, ctx, onCreate: crud.onCreate })
      }
    }
    throw redirect(base)
  }

  const search = pageContext.urlParsed?.search ?? {}
  const hydrated = await hydrateView(view, { tables, db, scope, ctx, search, id })

  // A detail route (`@id`) whose keyed record/form row is missing — never existed, or not the
  // user's — is a 404, not an empty detail: the scoped lookup returned null, so nothing about
  // another owner's row reaches the client.
  if (id != null) {
    const detail = hydrated.sections.find((s) => s.block === 'record' || s.block === 'form')
    if (detail && (detail.resolved.row === null || detail.resolved.values === null)) throw render(404)
  }

  // Per-screen `can*` gate. Record screens (view/edit) check against the loaded row; index/create
  // take only ctx. A denied screen is a 403 (the nav also hides it). Missing predicate = allowed.
  const screen = crud.screen
  if (screen === 'index' && !(await allow(crud.canIndex, ctx))) throw render(403)
  else if (screen === 'create' && !(await allow(crud.canCreate, ctx))) throw render(403)
  else if (screen === 'view') {
    const row = hydrated.sections.find((s) => s.block === 'record')?.resolved.row
    if (row && !(await allow(crud.canView, row, ctx))) throw render(403)
  } else if (screen === 'edit') {
    const row = hydrated.sections.find((s) => s.block === 'form')?.resolved.values
    if (row && !(await allow(crud.canEdit, row, ctx))) throw render(403)
  }

  return { route: hydrated.route, sections: hydrated.sections }
}
