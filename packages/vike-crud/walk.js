// Walk resolved view sections, descending into container blocks' nested children (#574). A view's
// blocks are freely composable: a `form` (or `list` / `record`) can sit inside a `card`, a `tabs`
// panel, a `field`, a `collapsible`, and so on. The CRUD machinery must find and hydrate a block
// WHEREVER it is, not only at the top level, or composing a form into a card silently breaks
// create/update — the POST handler finds no fields, so the submit round-trips a 302 and writes
// nothing (and a nested EDIT form that never gets hydrated would submit blanks over live data).
//
// A resolved section is `{ block, props, resolved }`; a container stashes its resolved children under
// `resolved` (arrays like `sections` / `footer` / `actions`, an `items[].sections` list, a `slots`
// map, or a single `control`). We locate section nodes generically by their string `block` key, so
// this covers every container (and any future one) without enumerating container types. Non-section
// data under `resolved` (rows, fields, columns) is walked too but never matches, so it passes through.

// A resolved section node.
const isSection = (v) => v != null && typeof v === 'object' && typeof v.block === 'string'

// Yield every section node reachable from `value` (a section, an array, or a `resolved` object),
// each one BEFORE its descendants (a container before the blocks it holds).
export function* walkSections(value) {
  if (Array.isArray(value)) {
    for (const v of value) yield* walkSections(v)
    return
  }
  if (isSection(value)) {
    yield value
    if (value.resolved != null && typeof value.resolved === 'object') {
      for (const v of Object.values(value.resolved)) yield* walkSections(v)
    }
    return
  }
  if (value != null && typeof value === 'object') {
    for (const v of Object.values(value)) yield* walkSections(v)
  }
}

// The first section (at any depth) matching `pred`, or null. The nesting-aware replacement for a
// top-level `sections.find(...)`.
export function findSection(sections, pred) {
  for (const s of walkSections(sections)) if (pred(s)) return s
  return null
}

// Deep-map every section node under `sections`, replacing each with `fn(section)` (which may be
// async) AFTER its descendants are mapped, rebuilding container structure around the results. A
// section whose subtree didn't change keeps its reference, so hydrating one form doesn't clone the
// rest of the tree (and non-section data like a loaded row keeps its identity).
export function mapSections(sections, fn) {
  return transform(sections, fn)
}

async function transform(value, fn) {
  if (Array.isArray(value)) {
    const out = await Promise.all(value.map((v) => transform(v, fn)))
    return out.some((v, i) => v !== value[i]) ? out : value
  }
  if (isSection(value)) {
    let node = value
    if (value.resolved != null && typeof value.resolved === 'object') {
      const resolved = await transform(value.resolved, fn)
      if (resolved !== value.resolved) node = { ...value, resolved }
    }
    return fn(node)
  }
  if (value != null && typeof value === 'object') {
    const entries = Object.entries(value)
    const mapped = await Promise.all(entries.map(([, v]) => transform(v, fn)))
    if (mapped.every((v, i) => v === entries[i][1])) return value
    const out = {}
    entries.forEach(([k], i) => (out[k] = mapped[i]))
    return out
  }
  return value
}
