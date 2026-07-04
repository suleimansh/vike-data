// The page-generation glue: turn a list of `definePage`s into Vike `config.pages`, and (at
// request time) resolve which view a page is for. An app declares its views and spreads
// `viewPages(views)` into its `+config.js` `pages`, so each view.route becomes a real Vike page
// backed by ONE generic page (ViewPage) + ONE generic data hook (viewData); the hook reads the
// `views` config point to know which view this route is. Plain JS (no JSX) so it is testable.
import { resolvePage } from 'vike-blocks'

// The config-time authoring surface, re-exported here so an app imports everything it declares its
// views with from ONE jsx-free entry: `import { definePage, crudBlocks, viewPages } from
// 'vike-crud/react/pages'`. It must be jsx-free because +config.js and its +views file are loaded
// by Vike's Node config loader, which cannot transpile the .jsx the 'vike-crud/react' barrel pulls
// in (the barrel is for RUNTIME page components). All of these come from the pure-JS core.
export { definePage, crudBlocks, defineCrud, crud, column, display, field } from '../index.js'

// A cumulative `views` config arrives as an array of per-source contributions; flatten it (an
// entry may be an array or a function returning one), matching how the schemas point flattens.
export function normalizeViews(views) {
  return (views ?? []).flatMap((v) => (typeof v === 'function' ? v() || [] : Array.isArray(v) ? v : v ? [v] : []))
}

// Build the Vike pages for a set of views: one page per view.route, all sharing the generic
// ViewPage + viewData (referenced by pointer-import strings, which Vike loads via Vite).
export function viewPages(views) {
  return normalizeViews(views)
    .filter((v) => typeof v?.route === 'string' && v.route)
    .map((v) => ({
      route: v.route,
      Page: 'import:vike-crud/react/ViewPage:default',
      data: 'import:vike-crud/react/viewData:viewData',
    }))
}

// Match a route PATTERN (Vike route-string style, an `@seg` segment is a named param) against a
// concrete pathname. Returns the captured params (`{}` when there are none), or null when the
// pattern doesn't match. Fixed-shape CRUD routes only — no `*` catch-all.
export function matchRoute(pattern, pathname) {
  const pp = String(pattern).replace(/\/+$/, '').split('/')
  const xp = String(pathname).replace(/\/+$/, '').split('/')
  if (pp.length !== xp.length) return null
  const params = {}
  for (let i = 0; i < pp.length; i++) {
    const seg = pp[i]
    if (seg.startsWith('@')) {
      if (xp[i] === '') return null
      params[seg.slice(1)] = decodeURIComponent(xp[i])
    } else if (seg !== xp[i]) {
      return null
    }
  }
  return params
}

// Resolve a pathname to its view AND the captured route params. Static segments win over params,
// so `/posts/new` (the create screen) is picked over `/posts/@id` (the view screen) for the
// pathname `/posts/new`. Returns null when nothing matches.
export function resolveViewRequest(views, pathname) {
  let best = null
  for (const view of normalizeViews(views)) {
    if (typeof view?.route !== 'string' || !view.route) continue
    const params = matchRoute(view.route, pathname)
    if (!params) continue
    const literals = view.route.split('/').filter((s) => s && !s.startsWith('@')).length
    if (!best || literals > best.literals) best = { view, params, literals }
  }
  return best ? { view: best.view, params: best.params } : null
}

// The view whose route matches this pathname (exact or `@param`), params discarded. Kept for the
// callers that only need the view; the data hook uses resolveViewRequest to also read the params.
export function viewForRoute(views, route) {
  return resolveViewRequest(views, route)?.view ?? null
}

// Which dialog the URL asks to open on a dialog-mode index page: `?view=<id>` / `?edit=<id>` open
// the record / edit-form dialog for that row; `?create` opens the create-form dialog. Returns
// `{ screen, id }` or null (no dialog). If several are set, the most specific read wins
// (view > edit > create), so a stray param can't open two dialogs.
export function activeDialog(search = {}) {
  if (search.view) return { screen: 'view', id: String(search.view) }
  if (search.edit) return { screen: 'edit', id: String(search.edit) }
  if (search.create != null) return { screen: 'create', id: null }
  return null
}

// Whether an in-place (non-dialog) section has something to render — the guard that keeps an empty
// CRUD block off the page (the empty `<dl>` this whole epic set out to kill). A `record` needs a
// row. A `form` renders UNLESS it is an EDIT screen with no loaded row (an empty edit on an index):
// a create form's blank inputs are the point, and a hand-written / legacy untagged form is a create.
// Any other block (list / heading / text) always renders.
export function sectionHasContent(section) {
  const { block, props, resolved } = section ?? {}
  if (block === 'record') return resolved?.row != null
  if (block === 'form') return props?.screen !== 'edit' || resolved?.values?.[resolved?.pk] != null
  return true
}

// The resolved form fields for a `form` block on `table` in this view — what the POST handler
// coerces the submitted form against.
export function formFieldsFor(view, tables, table) {
  const resolved = resolvePage(view, tables)
  const form = resolved.sections.find((s) => s.block === 'form' && s.props.table === table)
  return form?.resolved.fields ?? null
}
