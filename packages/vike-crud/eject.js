// Customization tier 3: EJECT. Config refines a generated view; slot overrides (#379) swap one
// widget; eject is the escape hatch for the production long-tail — it hands you the whole page as
// plain, owned source and steps out of the way. No more generated ViewPage / viewData / `views`
// config dispatch: the view descriptor, the row-scope, and the read/write logic are written into
// files in your own page folder, and nothing regenerates them.
//
//   const { files } = ejectView(view, { framework: 'react' })
//   // -> [{ path: 'pages/posts/+data.js',  source },
//   //     { path: 'pages/posts/+Page.jsx', source }]
//
// The output leans on two guarantees of the block IR: a view's `sections` are SERIALIZABLE block
// descriptors (so they emit as an editable literal), and its `scope` is a real function (so its
// source is emitted verbatim — you get the exact predicate back, not a stub). A CLI or the
// vike-toolbar writes `files` to disk; this module is pure so it stays node:test-testable.
//
// This is deliberately NOT a code-expander: it emits `<Blocks sections>` (the same renderer path
// the generated page used), because the point of eject is to give you a real, editable file to
// grow — not to pre-explode every block into markup you would have to reconcile on the next edit.

import { SCREEN_BLOCK } from './define.js'

const IDENT = /^[A-Za-z_$][\w$]*$/

function quote(str) {
  return `'${String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`
}

// Emit a value as a readable multi-line JS literal at `depth` (2-space indent). Only the
// serializable IR shapes are valid inside `sections`; a function here means a non-serializable
// prop leaked into a block descriptor, which is exactly what the IR forbids — fail loudly.
function literal(value, depth = 0) {
  const pad = '  '.repeat(depth)
  const padIn = '  '.repeat(depth + 1)
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  const t = typeof value
  if (t === 'string') return quote(value)
  if (t === 'number' || t === 'boolean') return String(value)
  if (t === 'function') {
    throw new Error('ejectView: a section carries a function — block descriptors must be serializable (no functions in `sections`)')
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((v) => `${padIn}${literal(v, depth + 1)}`).join(',\n')
    return `[\n${items},\n${pad}]`
  }
  if (t === 'object') {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined)
    if (entries.length === 0) return '{}'
    const body = entries
      .map(([k, v]) => `${padIn}${IDENT.test(k) ? k : quote(k)}: ${literal(v, depth + 1)}`)
      .join(',\n')
    return `{\n${body},\n${pad}}`
  }
  throw new Error(`ejectView: cannot serialize a ${t} value in a section`)
}

// A route -> a folder slug for the ejected page. `/posts` -> `posts`, `/` -> `home`. Dynamic
// segments (`@id`, `:id`, `*`) are kept as static-looking words with a note, since the ejected
// files are placed by hand anyway.
export function routeToSlug(route) {
  if (typeof route !== 'string' || !route.trim()) return 'view'
  const slug = route
    .replace(/[@:*]/g, '')
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('-')
    .replace(/[^\w-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || 'home'
}

// The scope function's own source, or `undefined`. `Function.prototype.toString()` gives back the
// exact predicate you wrote; a scope that closes over outer variables won't resolve on its own once
// moved, so we flag that case rather than emit code that would silently break.
function scopeSource(scope) {
  if (typeof scope !== 'function') return { source: 'undefined', note: null }
  let src
  try {
    src = scope.toString()
  } catch {
    return { source: 'undefined', note: 'could not read your scope function — re-add it by hand' }
  }
  if (src.includes('[native code]')) return { source: 'undefined', note: 'scope was a native/bound function — re-add it by hand' }
  return { source: src, note: null }
}

function dataFile({ route, sections, scope, pkg }) {
  const { source: scopeSrc, note: scopeNote } = scopeSource(scope)
  const scopeLine = scopeNote
    ? `// NOTE: ${scopeNote}.\nconst scope = ${scopeSrc}`
    : `const scope = ${scopeSrc}`
  return `// Ejected from vike-crud — this page's data layer is now YOURS. There is no generated
// viewData or \`views\` config dispatch: the view descriptor, the row-scope, and the read/write
// path all live here. Edit the sections, change the query, add fields — nothing regenerates.
import { redirect, render } from 'vike/abort'
import { csrfGuard } from 'vike-csrf'
import { resolveViewTables, buildDb, hydrateView, createRow, updateRow, definePage, resolvePage, findSection } from '${pkg}'
import { csrfRequestOf } from '${pkg}/request'

const ROUTE = ${quote(route)}

// Your view, inlined. \`sections\` is the serializable block IR — edit it directly, or rebuild it
// with crudBlocks / column / field (re-import those from '${pkg}') if you prefer the fluent form.
const view = definePage({
  route: ROUTE,
  sections: ${literal(sections, 1)},
})

// Your row-scope (the owner contract, #104): it bounds every read and is forced onto writes.
${scopeLine}

// Read the submitted form the same way on a server adapter (Web Request) or under \`vite dev\` (raw
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

// The resolved fields of this view's \`form\` block for \`table\` — what a POST coerces against.
// findSection looks at any depth, so a form nested in a card / tab still writes.
function formFields(tables, table) {
  const form = findSection(resolvePage(view, tables).sections, (s) => s.block === 'form' && s.props.table === table)
  return form?.resolved.fields ?? null
}

export async function data(pageContext) {
  const tables = resolveViewTables(pageContext.config)
  const db = buildDb(tables)
  const ctx = { user: pageContext.user }

  const req = readForm(pageContext)
  if (req.method === 'POST') {
    // Cross-site form POSTs are rejected (vike-csrf); policy from the app's csrf config key.
    const surfaced = csrfRequestOf(pageContext)
    if (surfaced && csrfGuard(surfaced)) throw render(403)
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
`
}

function reactPage({ pkg }) {
  return `// Ejected page — plain vike-react. It renders the hydrated sections through <Blocks> (the same
// renderer path the generated view used). As you outgrow the composition, wrap it in your own JSX,
// or replace <Blocks> with explicit <ListView/> / <RecordView/> / <FormView/> from '${pkg}/react'.
import { useData } from 'vike-react/useData'
import { Blocks } from '${pkg}/react'

export default function Page() {
  const { sections } = useData()
  return <Blocks sections={sections} />
}
`
}

function vuePage({ pkg }) {
  return `<!-- Ejected page — plain vike-vue. It renders the hydrated sections through <Blocks> (the same
renderer path the generated view used). Replace <Blocks> with explicit ListView / RecordView /
FormView from '${pkg}/vue' as you outgrow the composition. -->
<script setup>
import { useData } from 'vike-vue/useData'
import { Blocks } from '${pkg}/vue'

const { sections } = useData()
</script>

<template>
  <Blocks :sections="sections" />
</template>
`
}

const PAGE = {
  react: { ext: 'jsx', build: reactPage },
  vue: { ext: 'vue', build: vuePage },
}

// Generate the ownable page for `view` in `framework` ('react' | 'vue'). Returns
// `{ dir, route, slug, files: [{ path, source }] }` — the caller writes each file to disk. `pkg`
// overrides the import specifier for the vike-crud package (useful in-repo / for tests).
export function ejectView(view, opts = {}) {
  if (!view || typeof view !== 'object' || !Array.isArray(view.sections)) {
    throw new Error('ejectView: expected a view (from definePage) with a `sections` array')
  }
  const framework = opts.framework ?? 'react'
  const page = PAGE[framework]
  if (!page) throw new Error(`ejectView: unknown framework "${framework}" (expected 'react' or 'vue')`)

  const route = typeof view.route === 'string' && view.route ? view.route : '/'
  const slug = opts.slug ?? routeToSlug(route)
  const dir = `pages/${slug}`
  const pkg = opts.pkg ?? 'vike-crud'

  return {
    dir,
    route,
    slug,
    files: [
      { path: `${dir}/+data.js`, source: dataFile({ route, sections: view.sections, scope: view.scope, pkg }) },
      { path: `${dir}/+Page.${page.ext}`, source: page.build({ pkg }) },
    ],
  }
}

// ---- Resource eject: a `defineCrud` back into the explicit `definePage[]` it expands to ----
//
// `defineCrud('posts', { ... })` is INTENT; it derives the index/view/create/edit pages a resource
// needs. `ejectCrud` reverses that sugar: given the page array `defineCrud` returned, it emits the
// same pages as PLAIN, OWNED source, each built from the primitive tier — `definePage({ route,
// sections })` with `crud.index / crud.view / crud.create / crud.edit` for the screens. The resource
// helper is gone; you get the real pages, editable per-page (add a route, drop the edit dialog,
// reorder folded sections), and it round-trips: the emitted array is the same object graph, so it
// renders identically through the same `viewPages` + ViewPage + data hook.
//
// This differs from `ejectView` (which de-generates ONE page down to its own +data hook): a resource
// ejects to its `views` ARRAY, since crud pages route through `viewPages(views)`, not the filesystem.

// Resource-level, server-only auth carried on each page's `crud` meta — hoisted to named consts.
const AUTH_KEYS = ['query', 'onCreate', 'canIndex', 'canView', 'canCreate', 'canEdit', 'canDelete']

// A single-line rendering of a function-free value, or null if it contains a function (which must
// be placed by hand) or is otherwise not inline-able. Used to keep small specs / nav on one line.
function inlineValue(value) {
  if (typeof value === 'function') return null
  if (value === null || value === undefined || typeof value !== 'object') return literal(value, 0)
  if (Array.isArray(value)) {
    const parts = value.map(inlineValue)
    return parts.some((p) => p === null) ? null : `[${parts.join(', ')}]`
  }
  const entries = Object.entries(value).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return '{}'
  const parts = []
  for (const [k, v] of entries) {
    const iv = inlineValue(v)
    if (iv === null) return null
    const key = IDENT.test(k) ? k : quote(k)
    parts.push(iv === key ? key : `${key}: ${iv}`)
  }
  return `{ ${parts.join(', ')} }`
}

// Emit a value as source. Like `literal`, but a function is emitted as an IDENTIFIER when it is a
// hoisted resource-auth fn (already in `fns`), else inlined from its own source (a per-field
// `.when` predicate). This is what lets the resource's server-only functions survive eject verbatim.
// Function-free values that fit on one line are kept inline; larger ones expand with 2-space indent.
function emitValue(value, depth, fns) {
  if (typeof value === 'function') {
    if (fns.has(value)) return fns.get(value)
    const { source, note } = scopeSource(value)
    return note ? `/* ${note} */ ${source}` : source
  }
  if (value === null || value === undefined || typeof value !== 'object') return literal(value, depth)
  const flat = inlineValue(value)
  if (flat !== null && flat.length <= 72) return flat
  const pad = '  '.repeat(depth)
  const padIn = '  '.repeat(depth + 1)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((v) => `${padIn}${emitValue(v, depth + 1, fns)}`).join(',\n')
    return `[\n${items},\n${pad}]`
  }
  const entries = Object.entries(value).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return '{}'
  const body = entries
    .map(([k, v]) => {
      const key = IDENT.test(k) ? k : quote(k)
      const vs = emitValue(v, depth + 1, fns)
      return `${padIn}${vs === key ? key : `${key}: ${vs}`}`
    })
    .join(',\n')
  return `{\n${body},\n${pad}}`
}

// One section as a `crud.<screen>(table, specs)[0]` call plus the keys `defineCrud` decorates it
// with (`present`, `screen`, and — on the index list — the `nav` descriptor). A non-crud section
// (a hand-added heading/text with no `screen`) is emitted as a plain object literal.
function sectionExpr(section, depth, fns) {
  const { screen } = section
  const refineKey = SCREEN_BLOCK[screen]?.refine
  if (!refineKey) return emitValue(section, depth, fns)
  const specs = section[refineKey]
  const args = specs === undefined ? quote(section.table) : `${quote(section.table)}, ${emitValue(specs, depth, fns)}`
  const extra = { present: section.present, screen }
  if (section.nav !== undefined) extra.nav = section.nav
  const extraStr = Object.entries(extra)
    .map(([k, v]) => `${k}: ${emitValue(v, depth + 1, fns)}`)
    .join(', ')
  return `{ ...crud.${screen}(${args})[0], ${extraStr} }`
}

// One `definePage({ route, sections, crud })` call.
function pageExpr(page, depth, fns) {
  const pad = '  '.repeat(depth)
  const padIn = '  '.repeat(depth + 1)
  const padSec = '  '.repeat(depth + 2)
  const sections = page.sections.map((s) => `${padSec}${sectionExpr(s, depth + 2, fns)}`).join(',\n')
  const crudMeta = page.crud ? `\n${padIn}crud: ${emitValue(page.crud, depth + 1, fns)},` : ''
  return `${pad}definePage({\n${padIn}route: ${quote(page.route)},\n${padIn}sections: [\n${sections},\n${padIn}],${crudMeta}\n${pad}})`
}

function crudHeader(pkg, base) {
  return `// Ejected from vike-crud — the defineCrud resource for ${quote(base)} is now these explicit pages,
// YOURS to edit. Each page is the primitive tier: definePage({ route, sections }) with
// crud.index / crud.view / crud.create / crud.edit for the screens, plus the present / screen / nav /
// crud metadata the resource attached. Spread this array into your app's \`views\` (or make it your
// +views.js); it renders through the same viewPages path, so nothing about the output changes — you
// have just traded the resource sugar for editable pages.
import { definePage, crud } from '${pkg}'
`
}

// Eject a `defineCrud(...)` result (its `definePage[]`) to plain, owned source. Returns
// `{ slug, path, base, files: [{ path, source }] }`; the caller writes the file. `pkg` overrides the
// import specifier (useful in-repo / for tests). The resource's server-only auth fns are hoisted to
// named consts (deduped by reference — a route-mode resource repeats them across its four pages).
export function ejectCrud(pages, opts = {}) {
  if (!Array.isArray(pages) || pages.length === 0 || !pages.every((p) => p && typeof p === 'object' && Array.isArray(p.sections))) {
    throw new Error('ejectCrud: expected the definePage[] that defineCrud(...) returns')
  }
  const pkg = opts.pkg ?? 'vike-crud/react/pages'
  const indexPage = pages.find((p) => p.crud?.screen === 'index') ?? pages[0]
  const base = indexPage.crud?.base ?? indexPage.route ?? '/'
  const slug = opts.slug ?? routeToSlug(base)
  const path = opts.path ?? `pages/${slug}.crud.js`

  const fns = new Map()
  const consts = []
  for (const page of pages) {
    const c = page.crud ?? {}
    for (const k of AUTH_KEYS) {
      const fn = c[k]
      if (typeof fn === 'function' && !fns.has(fn)) {
        fns.set(fn, k)
        const { source, note } = scopeSource(fn)
        consts.push(note ? `// NOTE: ${note}.\nconst ${k} = ${source}` : `const ${k} = ${source}`)
      }
    }
  }

  const body = pages.map((p) => pageExpr(p, 1, fns)).join(',\n')
  const source = `${crudHeader(pkg, base)}${consts.length ? `\n${consts.join('\n')}\n` : ''}\nexport default [\n${body},\n]\n`

  return { slug, path, base, files: [{ path, source }] }
}
