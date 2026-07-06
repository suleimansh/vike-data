// The resource API — the admin dialect vike-crud now speaks. It comes in two halves:
//
//   defineResource({ table, ... })   declare a table as a CRUD resource (INTENT)
//   resourcePages(resource, { base }) mount that resource as the definePage[] it needs
//
// `defineResource` is a pure, serializable declaration; `resourcePages` is the page-mounting
// half that expands it into index / view / create / edit pages, choosing per-screen
// presentation. Splitting the two lets a resource be authored once and mounted (vike-crud) or
// introspected (vike-admin's data layer, which reads its list/record/form + mode + auth) the
// same way. No routing, rendering, or data access here — the render/route/data wiring (#577-#580)
// and the auth model (#581) consume the output. Being pure keeps it fully unit-testable.
//
//   defineResource({
//     table: 'posts',
//     mode: 'route',                     // default presentation for view/create/edit (route is default)
//     index: [ column('title') ],        // screen keys carry the refinement; absent = derive all,
//     view:  [ display('title') ],       //   `false` = drop the screen, `{ mode, fields }` = override
//     edit:  [ field('title') ],         //   presentation for that one screen. `create` aliases `edit`.
//     query, onCreate, canEdit, ...       // resource-level auth (server-only; rides on page meta)
//   })
//
// Routes (route-mode screens):  index -> /posts  view -> /posts/@id  create -> /posts/new
//                               edit  -> /posts/@id/edit
// dialog/inline screens fold onto the index page as extra sections tagged with their `present`,
// so the index route stays list-only until a screen is triggered (this is what kills the empty
// `<dl>` the old `crudBlocks` triad rendered). The screen vocabulary (index/view/edit) is the ONLY
// authoring surface: the block keys (list/record/form) are NOT a second back-door, they are ignored.
import { definePage } from 'vike-blocks'
import { screenBlock } from './define.js'

// `inline` is the engine-only extra mode (screens stacked in place). The admin dialect authors with
// route/dialog; inline stays available for a per-page resource that wants the stacked form.
const MODES = ['route', 'dialog', 'inline']
const SCREENS = ['index', 'view', 'create', 'edit']
const ROUTE = {
  index: (base) => base,
  view: (base) => `${base}/@id`,
  create: (base) => `${base}/new`,
  edit: (base) => `${base}/@id/edit`,
}
// Resource-level keys that ride on page metadata (server-side; never in a serialized section).
const AUTH_KEYS = ['query', 'onCreate', 'canIndex', 'canView', 'canCreate', 'canEdit', 'canDelete']

// The field/spec array a screen carries, or undefined when it derives every field from the schema.
// A screen value is an array of specs, `{ mode, fields }`, `false` (drop), or absent. `list/record/
// form` on the resource are these flat arrays, so vike-admin's schema derivation (viewColumns /
// viewRecord / viewFields) reads the same resource a per-page mount does.
const fieldsOf = (raw) => (Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? raw.fields : undefined)

// Normalize one screen's option into `{ present, fields }`, or `null` when the screen is dropped.
// A value is: an array of specs (inherits the resource mode), `{ mode, fields }` (override the
// presentation), `false` (drop), or absent (include, derive every field from the schema). When
// `create` is left unset it mirrors `edit`'s FIELDS (create/edit forms are usually identical), but
// its presentation still follows the resource mode — overriding edit's presentation does not flip
// create. A dropped/absent `edit` just leaves `create` to derive from the schema, so dropping `edit`
// never silently drops `create`.
function screenCfg(screens, name, defaultMode) {
  const raw = screens[name]
  if (name === 'create' && raw === undefined) {
    const fields = fieldsOf(screens.edit)
    if (fields !== undefined) return { present: defaultMode, fields }
    // edit is false/absent -> fall through and derive create from the schema
  }
  if (raw === false) return null
  if (raw === undefined) return { present: name === 'index' ? 'route' : defaultMode, fields: undefined }
  if (Array.isArray(raw)) return { present: name === 'index' ? 'route' : defaultMode, fields: raw }
  if (typeof raw === 'object') {
    if (raw.mode !== undefined && !MODES.includes(raw.mode)) {
      throw new Error(`defineResource: \`${name}.mode\` must be one of ${MODES.join(' | ')} (got ${JSON.stringify(raw.mode)})`)
    }
    if (raw.fields !== undefined && !Array.isArray(raw.fields)) {
      throw new Error(`defineResource: \`${name}.fields\` must be an array of specs`)
    }
    // index is always its own route; its `mode` is ignored.
    return { present: name === 'index' ? 'route' : raw.mode ?? defaultMode, fields: raw.fields }
  }
  throw new Error(`defineResource: \`${name}\` must be an array of specs, { mode, fields }, or false (got ${JSON.stringify(raw)})`)
}

// Declare a CRUD resource for a table. `table` is the only required field; everything else refines
// the schema-derived default. Object signature (the admin dialect); `mode` defaults to 'route'. The
// return value is a plain resource descriptor: `resourcePages` mounts it, and vike-admin's data layer
// introspects its `list/record/form` + `mode` + auth.
export function defineResource(def = {}) {
  if (def == null || typeof def !== 'object' || Array.isArray(def)) {
    throw new Error('defineResource: expected a definition object, e.g. defineResource({ table: "posts" })')
  }
  const { table } = def
  if (typeof table !== 'string' || !table) {
    throw new Error('defineResource: `table` (a table name in the composed schema) is required, e.g. defineResource({ table: "posts" })')
  }
  const mode = def.mode ?? 'route'
  if (!MODES.includes(mode)) {
    throw new Error(`defineResource: \`mode\` must be one of ${MODES.join(' | ')} (got ${JSON.stringify(def.mode)})`)
  }
  if (def.route !== undefined && (typeof def.route !== 'string' || !def.route.startsWith('/'))) {
    throw new Error('defineResource: `route`, when set, must be an absolute path like "/posts"')
  }

  // Screen vocabulary only. The old block keys (list/record/form) are NOT a second authoring surface;
  // pull them out so they don't pass through. Everything else (label / recordTitle / icon / slots /
  // query / onCreate / canX / route) passes through untouched, exactly as it did in the admin.
  const { index, view, create, edit, list: _l, record: _r, form: _f, ...rest } = def
  const screens = { index, view, create, edit }
  // Validate the screen shapes eagerly (a typo is an authoring error, not a silently-derived screen).
  for (const name of SCREENS) screenCfg(screens, name, mode)

  const resource = { icon: null, ...rest, table, mode }
  // Raw screen configs drive `resourcePages`; the flat list/record/form arrays drive the schema
  // derivation vike-admin reads (viewColumns / viewRecord / viewFields). `create` aliases `edit`.
  resource.screens = screens
  resource.list = fieldsOf(index)
  resource.record = fieldsOf(view)
  resource.form = edit !== undefined ? fieldsOf(edit) : fieldsOf(create)
  return resource
}

// Mount a resource as the pages it needs: index / view / create / edit, each presented per the
// resource `mode` (or a per-screen override). `base` (default `resource.route ?? /<table>`) is the
// resource's index route — where a write on any screen redirects back to. This is the page-mounting
// half of the old `defineCrud`; `ejectCrud` reveals exactly the `definePage[]` it returns.
export function resourcePages(resource, { base } = {}) {
  if (resource == null || typeof resource !== 'object' || typeof resource.table !== 'string' || !resource.table) {
    throw new Error('resourcePages: expected a resource from defineResource(...)')
  }
  const table = resource.table
  const defaultMode = resource.mode ?? 'route'
  const root = base ?? resource.route ?? `/${table}`
  if (typeof root !== 'string' || !root.startsWith('/')) {
    throw new Error('resourcePages: `base` must be an absolute path like "/posts"')
  }
  const screensRaw = resource.screens ?? {}

  // Resource-level auth, carried on every emitted page's server-only `crud` meta.
  const auth = {}
  for (const k of AUTH_KEYS) if (resource[k] !== undefined) auth[k] = resource[k]
  const meta = (screen, present) => ({ crud: { table, screen, present, base: root, ...auth } })

  const screens = SCREENS.map((name) => ({ name, cfg: screenCfg(screensRaw, name, defaultMode) })).filter((s) => s.cfg)
  const indexScreen = screens.find((s) => s.name === 'index')
  const section = (name, cfg, present) => ({ ...screenBlock(name, table, cfg.fields), present, screen: name })

  // A dialog/inline screen folds onto the index page as an extra section; without an index page to
  // fold onto it falls back to its own route.
  const folded = []
  const routePages = []
  for (const { name, cfg } of screens) {
    if (name === 'index') continue
    if ((cfg.present === 'dialog' || cfg.present === 'inline') && indexScreen) {
      folded.push(section(name, cfg, cfg.present))
    } else {
      routePages.push(definePage({ route: ROUTE[name](root), sections: [section(name, cfg, 'route')], ...meta(name, 'route') }))
    }
  }

  const pages = []
  if (indexScreen) {
    // A serializable navigation descriptor on the index list: how each screen is reached, so the
    // renderer wires row links + a New link per presentation (route -> its own URL, dialog -> a
    // `?screen=id` query, inline -> already on the page, no link). `base` anchors the route paths.
    const nav = { base: root }
    for (const { name, cfg } of screens) if (name !== 'index') nav[name] = cfg.present
    const indexSection = { ...section('index', indexScreen.cfg, 'route'), nav }
    pages.push(definePage({ route: root, sections: [indexSection, ...folded], ...meta('index', 'route') }))
  }
  pages.push(...routePages)
  return pages
}
