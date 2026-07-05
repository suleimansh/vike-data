// The block registry — the open set of block types a page can compose. A BLOCK is one
// section of a page: a `{ block: <type>, ...props }` descriptor. Most blocks are bespoke
// (their view-model is just their props); a block can also be schema/data-aware by carrying
// a `resolve` (vike-crud's list/record/form register their derivation this way).
//
// The registry is OPEN: an extension registers its own block with `registerBlock(type, def)`
// (or, for a leaf block with a fluent builder, `defineBlock`), so a new block type ships
// alongside the component that renders it, with no change to vike-blocks. The genuine long
// tail that no block expresses drops to `block: 'custom'` (your component) or an AI-ejected
// real page — this stays a composition of blocks, not a layout DSL.
//
// A block DEFINITION is `{ resolve?({ props, tables }) -> model }`: the framework-agnostic
// step that turns a descriptor into a plain, serializable view-model. A block with no
// `resolve` passes its props through unchanged. Rendering a model to components is the
// renderer's job (a per-framework package), keyed on the same block type.

const REGISTRY = new Map()

// Register (or override) a block type. `def.resolve` is optional; a block without it is a
// pass-through (its resolved model is its props). Throws on a bad type/def so a typo is a
// clear error, not a silently ignored block.
export function registerBlock(type, def = {}) {
  if (typeof type !== 'string' || !type) throw new Error('registerBlock: a non-empty string type is required')
  if (def == null || typeof def !== 'object') throw new Error(`registerBlock(${JSON.stringify(type)}): def must be an object`)
  if (def.resolve != null && typeof def.resolve !== 'function') {
    throw new Error(`registerBlock(${JSON.stringify(type)}): def.resolve must be a function`)
  }
  if (def.params != null && !Array.isArray(def.params)) {
    throw new Error(`registerBlock(${JSON.stringify(type)}): def.params must be an array of param descriptors`)
  }
  // `params`/`builder` + the doc fields (category/summary/container/example) are
  // discovery metadata (see describeBlock + blockCatalog) — all optional, a block that
  // declares none still registers, it just describes as an opaque pass-through.
  REGISTRY.set(type, {
    type,
    resolve: def.resolve ?? null,
    params: def.params ?? null,
    builder: def.builder ?? null,
    category: def.category ?? null,
    summary: def.summary ?? null,
    container: def.container ?? false,
    example: def.example ?? null,
  })
  return def
}

export const getBlock = (type) => REGISTRY.get(type) ?? null
export const hasBlock = (type) => REGISTRY.has(type)
export const listBlocks = () => [...REGISTRY.keys()]

/**
 * Describe a registered block for PROGRAMMATIC discovery — this is the machine seam
 * behind "UI as data": an agent or tool can enumerate the catalog (describeBlocks /
 * blockCatalog) and, per type, learn how to compose it WITHOUT reading the block's
 * source. Returns null for an unknown type. Shape:
 *   { type, category, summary, container, passThrough,
 *     builder: { methods, arity } | null, params: [...] | null, example }
 * `passThrough` = no resolve step (its model is its props). `container` = it holds a
 * nested composition of blocks. `builder` is present for defineBlock blocks (`methods`
 * are the chainable refinements, `arity` the positional arg count). `category`,
 * `summary`, `params` and `example` are optional author-declared doc metadata.
 */
export function describeBlock(type) {
  const entry = REGISTRY.get(type)
  if (!entry) return null
  return {
    type: entry.type,
    category: entry.category,
    summary: entry.summary,
    container: entry.container,
    passThrough: !entry.resolve,
    builder: entry.builder,
    params: entry.params,
    example: entry.example,
  }
}

/** The whole catalog as descriptors — one describeBlock() per registered type. */
export const describeBlocks = () => [...REGISTRY.keys()].map(describeBlock)

/**
 * The version of the block-catalog contract (the describeBlock descriptor shape).
 * Bumped when the descriptor shape changes in a breaking way, so an agent consuming
 * blockCatalog() can guard on it.
 */
export const CATALOG_CONTRACT_VERSION = 1

/**
 * The whole catalog as a single serializable object for an AI agent / tool to consume:
 * `{ contractVersion, blocks }`. This is the stable seam the agent-side composition
 * flow codes against — it never needs to import vike-blocks internals.
 */
export function blockCatalog() {
  return { contractVersion: CATALOG_CONTRACT_VERSION, blocks: describeBlocks() }
}

// Define a BLOCK with a fluent authoring builder — in ONE call. This is the
// high-DX seam: a package ships a new block (its builder + descriptor shape + registry
// entry) with a single `defineBlock`, and registers the matching renderer per framework
// separately (`registerBlockRenderer`, in the framework package).
//
//   export const rating = defineBlock('rating', {
//     build:  (value) => ({ value }),                 // rating(3) -> { block:'rating', value:3 }
//     refine: { max: (n) => ({ max: n }), readonly: () => ({ readonly: true }) },
//     category: 'form', summary: 'A star-rating input.',   // optional: agent-catalog metadata
//     example: 'rating(3).max(5)',
//     params: [{ name: 'value', required: true }],
//   })
//   // author usage:  rating(3).max(5).readonly()
//
// `build(...args)` produces the base props; `refine` maps chainable method names to prop
// patches; `resolve` (optional) makes the block schema/data-aware instead of a pass-through.
// The optional doc fields (`category`, `summary`, `container`, `example`, `params`) are
// surfaced by describeBlock / blockCatalog so an agent can choose and fill the block.
// Returns the builder FACTORY; calling it yields a chainable builder whose `.build()` collapses
// to a `{ block, ...props }` descriptor — exactly what a view's `sections` accepts. The refine
// method names and build arity are recorded so describeBlock can report the builder surface.
export function defineBlock(type, { build, refine = {}, resolve, params, category, summary, container, example } = {}) {
  if (build != null && typeof build !== 'function') throw new Error(`defineBlock(${JSON.stringify(type)}): build must be a function`)
  if (refine == null || typeof refine !== 'object') throw new Error(`defineBlock(${JSON.stringify(type)}): refine must be an object of functions`)
  // Validate each refinement up front, so a typo (`refine: { max: 5 }`) throws HERE, where the
  // block author can fix it, not later as a cryptic "patch is not a function" in app code.
  for (const name of Object.keys(refine)) {
    if (typeof refine[name] !== 'function') throw new Error(`defineBlock(${JSON.stringify(type)}): refine.${name} must be a function`)
  }
  registerBlock(type, {
    ...(resolve ? { resolve } : {}),
    ...(params ? { params } : {}),
    ...(category ? { category } : {}),
    ...(summary ? { summary } : {}),
    ...(container ? { container } : {}),
    ...(example ? { example } : {}),
    builder: { methods: Object.keys(refine), arity: build ? build.length : 0 },
  })
  return (...args) => {
    const spec = build ? { ...build(...args) } : { ...(args[0] ?? {}) }
    const self = {}
    for (const name of Object.keys(refine)) {
      const patch = refine[name]
      self[name] = (...a) => {
        Object.assign(spec, patch(...a))
        return self
      }
    }
    self.build = () => ({ block: type, ...spec })
    return self
  }
}
