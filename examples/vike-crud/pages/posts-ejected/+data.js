// Ejected from vike-crud — this page's data layer is now YOURS. There is no generated
// viewData or `views` config dispatch: the view descriptor, the row-scope, and the read/write
// path all live here. Edit the sections, change the query, add fields — nothing regenerates.
import { redirect } from 'vike/abort'
import { resolveViewTables, buildDb, hydrateView, createRow, updateRow, definePage, resolvePage } from 'vike-crud'

const ROUTE = '/posts-ejected'

// Your view, inlined. `sections` is the serializable block IR — edit it directly, or rebuild it
// with crudBlocks / column / field (re-import those from 'vike-crud') if you prefer the fluent form.
const view = definePage({
  route: ROUTE,
  sections: [
    {
      block: 'list',
      table: 'posts',
      list: [
        {
          name: 'title',
          sortable: true,
          searchable: true,
        },
        {
          name: 'published',
        },
        {
          name: 'created_at',
          label: 'Created',
          format: 'since',
        },
      ],
    },
    {
      block: 'record',
      table: 'posts',
    },
    {
      block: 'form',
      table: 'posts',
      form: [
        {
          name: 'title',
          required: true,
        },
        {
          name: 'body',
        },
        {
          name: 'published',
        },
      ],
    },
  ],
})

// Your row-scope (the owner contract, #104): it bounds every read and is forced onto writes.
const scope = (table, ctx) => ({ user_id: ctx.user.id })

// Read the submitted form the same way on a server adapter (Web Request) or under `vite dev` (raw
// Node request). Inlined so this page owns its POST — no shared request reader to depend on.
function readForm(pageContext) {
  const web = pageContext._reqWeb
  if (web) return { method: web.method, formData: () => web.formData() }
  const nodeReq = pageContext._nodeDev?.req
  if (nodeReq) {
    return {
      method: nodeReq.method,
      formData: () =>
        new Promise((resolve, reject) => {
          let body = ''
          nodeReq.on('data', (c) => (body += c))
          nodeReq.on('end', () => resolve(new URLSearchParams(body)))
          nodeReq.on('error', reject)
        }),
    }
  }
  return { method: 'GET', formData: async () => new URLSearchParams() }
}

// The resolved fields of this view's `form` block for `table` — what a POST coerces against.
function formFields(tables, table) {
  const form = resolvePage(view, tables).sections.find((s) => s.block === 'form' && s.props.table === table)
  return form?.resolved.fields ?? null
}

export async function data(pageContext) {
  const tables = resolveViewTables(pageContext.config)
  const db = buildDb(tables)
  const ctx = { user: pageContext.user }

  const req = readForm(pageContext)
  if (req.method === 'POST') {
    const form = await req.formData()
    const table = form.get('_table')
    const fields = table ? formFields(tables, table) : null
    if (table && fields) {
      const id = form.get('_id')
      if (id) await updateRow(db, tables, table, fields, id, form, { scope, ctx })
      else await createRow(db, tables, table, fields, form, { scope, ctx })
    }
    throw redirect(ROUTE)
  }

  const search = pageContext.urlParsed?.search ?? {}
  const hydrated = await hydrateView(view, { tables, db, scope, ctx, search })
  return { sections: hydrated.sections }
}
