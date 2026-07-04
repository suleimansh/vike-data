// `defineCrud(table, opts?)` — the resource helper. Declares a table as a CRUD resource and
// derives the set of pages it needs: index / view / create / edit. It is INTENT; a pure function
// that expands to the explicit `definePage[]` primitive (what `crud.<screen>()` builds and `eject`
// reveals). No routing, no rendering, no data access here — the render/route/data wiring (#577-#580)
// and the auth model (#581) consume this output. Being pure keeps it fully unit-testable.
//
//   defineCrud('posts', {
//     mode: 'dialog',                    // default presentation for view/create/edit
//     index: [ column('title') ],        // page keys carry the refinement; absent = derive all,
//     view:  [ display('title') ],       //   `false` = drop the page, `{ mode, fields }` = override
//     edit:  [ field('title') ],         //   presentation for that one screen
//     query, onCreate, canEdit, ...       // resource-level auth (server-only; rides on page meta)
//   })
//
// Routes (route-mode screens):  index -> /posts  view -> /posts/@id  create -> /posts/new
//                               edit  -> /posts/@id/edit
// dialog/inline screens fold onto the index page as extra sections tagged with their `present`,
// so the index route stays list-only until a screen is triggered (this is what kills the empty
// `<dl>` the old `crudBlocks` triad rendered).
import { definePage } from 'vike-blocks'
import { screenBlock } from './define.js'

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

// Normalize one screen's option into `{ present, fields }`, or `null` when the screen is dropped.
// A value is: an array of specs (inherits the resource mode), `{ mode, fields }` (override the
// presentation), `false` (drop), or absent (include, derive every field from the schema). When
// `create` is left unset it mirrors `edit`'s FIELDS (create/edit forms are usually identical), but
// its presentation still follows the resource mode — overriding edit's presentation does not flip
// create. A dropped/absent `edit` just leaves `create` to derive from the schema, so dropping `edit`
// never silently drops `create`.
function screenCfg(opts, name, defaultMode) {
  const raw = opts[name]
  if (name === 'create' && raw === undefined) {
    const e = opts.edit
    const fields = Array.isArray(e) ? e : e && typeof e === 'object' ? e.fields : undefined
    if (fields !== undefined) return { present: defaultMode, fields }
    // edit is false/absent -> fall through and derive create from the schema
  }
  if (raw === false) return null
  if (raw === undefined) return { present: name === 'index' ? 'route' : defaultMode, fields: undefined }
  if (Array.isArray(raw)) return { present: name === 'index' ? 'route' : defaultMode, fields: raw }
  if (typeof raw === 'object') {
    if (raw.mode !== undefined && !MODES.includes(raw.mode)) {
      throw new Error(`defineCrud: \`${name}.mode\` must be one of ${MODES.join(' | ')} (got ${JSON.stringify(raw.mode)})`)
    }
    if (raw.fields !== undefined && !Array.isArray(raw.fields)) {
      throw new Error(`defineCrud: \`${name}.fields\` must be an array of specs`)
    }
    // index is always its own route; its `mode` is ignored.
    return { present: name === 'index' ? 'route' : raw.mode ?? defaultMode, fields: raw.fields }
  }
  throw new Error(`defineCrud: \`${name}\` must be an array of specs, { mode, fields }, or false (got ${JSON.stringify(raw)})`)
}

export function defineCrud(table, opts = {}) {
  if (typeof table !== 'string' || !table) {
    throw new Error('defineCrud: `table` (a table name in the composed schema) is required, e.g. defineCrud("posts", { ... })')
  }
  if (opts == null || typeof opts !== 'object' || Array.isArray(opts)) {
    throw new Error('defineCrud: the second argument must be an options object')
  }
  const defaultMode = opts.mode ?? 'dialog'
  if (!MODES.includes(defaultMode)) {
    throw new Error(`defineCrud: \`mode\` must be one of ${MODES.join(' | ')} (got ${JSON.stringify(opts.mode)})`)
  }
  const base = opts.route ?? `/${table}`
  if (typeof base !== 'string' || !base.startsWith('/')) {
    throw new Error('defineCrud: `route`, when set, must be an absolute path like "/posts"')
  }

  // Resource-level auth, carried on every emitted page's server-only `crud` meta.
  const auth = {}
  for (const k of AUTH_KEYS) if (opts[k] !== undefined) auth[k] = opts[k]
  // `base` is the resource's index route — where a write on any screen redirects back to.
  const meta = (screen, present) => ({ crud: { table, screen, present, base, ...auth } })

  const screens = SCREENS.map((name) => ({ name, cfg: screenCfg(opts, name, defaultMode) })).filter((s) => s.cfg)
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
      routePages.push(definePage({ route: ROUTE[name](base), sections: [section(name, cfg, 'route')], ...meta(name, 'route') }))
    }
  }

  const pages = []
  if (indexScreen) {
    // A serializable navigation descriptor on the index list: how each screen is reached, so the
    // renderer wires row links + a New link per presentation (route -> its own URL, dialog -> a
    // `?screen=id` query, inline -> already on the page, no link). `base` anchors the route paths.
    const nav = { base }
    for (const { name, cfg } of screens) if (name !== 'index') nav[name] = cfg.present
    const indexSection = { ...section('index', indexScreen.cfg, 'route'), nav }
    pages.push(definePage({ route: base, sections: [indexSection, ...folded], ...meta('index', 'route') }))
  }
  pages.push(...routePages)
  return pages
}
