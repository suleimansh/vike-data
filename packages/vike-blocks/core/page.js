// The composer: a PAGE is a composition of BLOCKS — the UI/UX schema, distinct from any data
// schema. `definePage({ route, sections })` declares which blocks a page is made of and,
// optionally, the route it mounts at; `resolvePage` turns those block descriptors into plain,
// serializable view-models a renderer can draw. vike-crud wraps this as `definePage`, its
// schema-flavored entry.
//
//   definePage({
//     route: '/dashboard',
//     sections: [
//       heading('Welcome'),
//       { block: 'stat',     title: 'Revenue', source: 'orders.sum(total)' },
//       { block: 'markdown', source: '# Notes' },
//       { block: 'custom',   component: 'MyChart' },
//     ],
//   })
import { getBlock, listBlocks } from './registry.js'

// Collapse a fluent block BUILDER to its plain descriptor, duck-typed by a callable `.build`
// (not truthiness — a bespoke block can carry a prop literally named `build`, e.g.
// { block: 'deploy', build: 'ci-123' }). A plain descriptor passes through unchanged. Shared by
// every container block that resolves nested block arrays, so the duck-type lives in one place.
export const collapseSection = (entry) => (typeof entry?.build === 'function' ? entry.build() : entry)
export const collapseSections = (entries) => (entries ?? []).map(collapseSection)

// Normalize a section list: flatten fully (so presets — even presets that return other
// presets, e.g. crudBlocks) mix with single blocks in the same array), collapse block
// builders to plain specs, and validate each carries a `block` type.
function normalizeSections(sections) {
  if (!Array.isArray(sections)) throw new Error('definePage: `sections` must be an array of blocks')
  const flat = sections.flat(Infinity).filter((s) => s != null)
  return flat.map((entry, i) => {
    const section = collapseSection(entry)
    if (!section || typeof section !== 'object' || typeof section.block !== 'string' || !section.block) {
      // A common slip: dropping a crud() CONFIG (which has `table` but no `block`) into sections
      // instead of crudBlocks(). Point the way.
      const hint =
        section && typeof section === 'object' && typeof section.table === 'string' && !section.block
          ? ` (a crud config is not a block — did you mean ...crudBlocks({ table: "${section.table}" })?)`
          : ''
      throw new Error(`definePage: section ${i} must be a block descriptor, e.g. { block: "list", table: "posts" }${hint}`)
    }
    return { ...section }
  })
}

// Declare a page. `sections` (the blocks the page is composed of) is required; `route` is the
// path the page mounts at (optional — a page can also be mounted manually by a renderer).
// Everything else (guard, label, ...) passes through for the renderer / page generator.
export function definePage(def) {
  if (!def || typeof def !== 'object') {
    throw new Error('definePage: expected a definition object, e.g. definePage({ route: "/", sections: [...] })')
  }
  if (def.route != null && typeof def.route !== 'string') {
    throw new Error('definePage: `route`, when set, must be a string path')
  }
  const { route, sections, ...rest } = def
  return { route: route ?? null, sections: normalizeSections(sections), ...rest }
}

// Resolve a page's blocks against the (optional) merged schema into serializable view-models.
// Each resolved section is `{ block, props, resolved }`: `props` is the descriptor minus its
// `block` type; `resolved` is the block's view-model (a schema-derived block fills it from the
// schema, a bespoke block echoes its props). An unknown block type is a clear error listing
// what IS registered — never a silently dropped section.
export function resolvePage(page, tables) {
  const sections = (page?.sections ?? []).map(({ block, ...props }, i) => {
    const def = getBlock(block)
    if (!def) {
      throw new Error(`resolvePage: unknown block "${block}". Registered blocks: ${listBlocks().join(', ')}`)
    }
    let resolved
    try {
      resolved = def.resolve ? def.resolve({ props, tables }) : { ...props }
    } catch (e) {
      // Name the failing section so a block's internal error isn't a context-free throw.
      throw new Error(`resolvePage: block "${block}" (section ${i}) failed to resolve: ${e.message}`, { cause: e })
    }
    return { block, props, resolved }
  })
  return { route: page?.route ?? null, sections }
}

// The recursive step every CONTAINER block shares: collapse a nested block array (builders or
// plain descriptors) and resolve it into serializable view-models. card/tabs/dialog/sheet/drawer/
// accordion/collapsible/form all wrap their nested sections through this — one place, so the
// collapse + resolve step can't drift block to block.
export function containerResolve(sections, tables) {
  return resolvePage({ sections: collapseSections(sections) }, tables).sections
}

// Same, for a SINGLE nested child (a field's control, a tooltip/menu trigger, an icon): resolves
// one block and returns its view-model, or null when absent.
export function containerResolveOne(entry, tables) {
  return entry ? resolvePage({ sections: [collapseSection(entry)] }, tables).sections[0] : null
}
