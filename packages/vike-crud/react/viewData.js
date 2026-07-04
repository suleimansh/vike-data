// The generic Vike DATA hook shared by every generated view page. It resolves which view + route
// params this pathname is (param routes like `/posts/@id` included), hydrates the view's blocks
// (owner-scoped list rows, a record's one row, an edit form's pre-fill) and returns the sections
// ViewPage renders. On POST it OWNS the write: create / update / delete through the scoped data
// layer, keyed on the route `id` (or the form's `_id` for the legacy single-page flow), then
// redirects to the resource's index. No separate endpoint — a plain SSR form post.
import { render, redirect } from 'vike/abort'
import { resolveViewTables, buildDb, hydrateView, createRow, updateRow, deleteRow } from '../index.js'
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
  const scope = view.scope // optional (table, ctx) => filter — the owner contract wires row scoping
  const id = params.id ?? null // a route param (the view / edit detail routes carry `@id`)
  const base = view.crud?.base ?? pathname // where a write redirects back to (the resource index)

  const req = readFormRequest(pageContext)
  if (req.method === 'POST') {
    const form = await req.formData()
    // The write target: the form declares `_table` (legacy single-page flow); a defineCrud route
    // page carries it on the view's crud meta. Fields are resolved from the view's form block.
    const table = form.get('_table') ?? view.crud?.table ?? null
    const fields = table ? formFieldsFor(view, tables, table) : null
    if (table && fields) {
      const rid = id ?? form.get('_id')
      if (form.get('_action') === 'delete' && rid) await deleteRow(db, tables, table, rid, { scope, ctx })
      else if (rid) await updateRow(db, tables, table, fields, rid, form, { scope, ctx })
      else await createRow(db, tables, table, fields, form, { scope, ctx })
    }
    throw redirect(base)
  }

  const search = pageContext.urlParsed?.search ?? {}
  const hydrated = await hydrateView(view, { tables, db, scope, ctx, search, id })

  // A detail route (`@id`) whose keyed record/form row is missing — never existed, or not the
  // user's — is a 404, not an empty detail page. This is the "a non-owned id does not leak" gate:
  // the scoped lookup already returned null, so nothing about another owner's row reaches the client.
  if (id != null) {
    const detail = hydrated.sections.find((s) => s.block === 'record' || s.block === 'form')
    if (detail && (detail.resolved.row === null || detail.resolved.values === null)) throw render(404)
  }

  return { route: hydrated.route, sections: hydrated.sections }
}
