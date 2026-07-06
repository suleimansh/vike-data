// The schema-driven blocks — vike-crud's contribution to vike-blocks' registry. Where a
// bespoke block (stat/markdown/custom) carries its own props, a `list`/`record`/`form` block
// DERIVES its view-model from the composed schema through the crud engine (viewColumns /
// viewRecord / viewFields) — the same derivation the crud preset uses, no second copy.
// Importing this module registers the three blocks into the shared registry.
import { registerBlock } from 'vike-blocks'
import { crud, plainSpecs } from './define.js'
import { tableNamed, viewColumns, viewRecord, viewFields } from './resolve.js'

// A table-derived block treats its own props as a crud() config (table + the same
// list/record/form/scope refinements), so the three blocks reuse the crud derivation exactly.
function tableFor(props, tables) {
  if (typeof props?.table !== 'string' || !props.table) {
    throw new Error('a table block needs a `table` name, e.g. { block: "list", table: "posts" }')
  }
  if (!Array.isArray(tables)) {
    throw new Error('resolveView: pass the composed tables as the second argument, e.g. resolveView(view, resolveViewTables(config))')
  }
  const table = tableNamed(tables, props.table)
  if (!table) throw new Error(`block table "${props.table}" is not in the composed schema`)
  return table
}

// Each block declares describeBlock/blockCatalog discovery metadata (category/summary/params/
// example) so an agent enumerating the catalog learns these are schema-derived and need a `table`
// prop, without reading this source. `params` lists the keys each block reads: the required table
// name plus its own refinement array and the shared `slots` map.
registerBlock('list', {
  category: 'data',
  summary: "A schema-derived table of a resource's rows (columns come from the composed schema).",
  params: [{ name: 'table', required: true }, { name: 'list' }, { name: 'slots' }],
  example: "{ block: 'list', table: 'posts' }",
  resolve({ props, tables }) {
    const table = tableFor(props, tables)
    return { table: props.table, columns: viewColumns(crud(props), table) }
  },
})
registerBlock('record', {
  category: 'data',
  summary: 'A schema-derived read-only detail view of one row of a resource.',
  params: [{ name: 'table', required: true }, { name: 'record' }, { name: 'slots' }],
  example: "{ block: 'record', table: 'posts' }",
  resolve({ props, tables }) {
    const table = tableFor(props, tables)
    return { table: props.table, fields: viewRecord(crud(props), table) }
  },
})
registerBlock('form', {
  category: 'data',
  summary: 'A schema-derived create/edit form for a resource (fields come from the composed schema).',
  params: [{ name: 'table', required: true }, { name: 'form' }, { name: 'slots' }],
  example: "{ block: 'form', table: 'posts' }",
  resolve({ props, tables }) {
    const table = tableFor(props, tables)
    return { table: props.table, fields: viewFields(crud(props), table) }
  },
})

// Resource-level authorization keys. They are enforced SERVER-SIDE by `defineCrud` (on page meta,
// read by viewData) or vike-admin's `defineResource` (in its data layer) — never by the block path.
// A block descriptor is serializable data handed to the renderer/client, so a function can't ride in
// it; crudBlocks would have to STRIP these, silently shipping an unscoped/ungated page. Reject them
// loudly instead and point at the enforced resource helper (#690).
const RESOURCE_AUTH_KEYS = ['scope', 'query', 'onCreate', 'canIndex', 'canView', 'canCreate', 'canEdit', 'canDelete']

// The crud PRESET as blocks: expand a table into its list + record + form block descriptors,
// so `sections: crudBlocks({ table: 'posts' })` drops the full CRUD triad into a page. Each
// block carries ONLY the keys it reads (its own refinement array), so the three descriptors
// share no nested references. crudBlocks shapes the UI only — row scoping and `can*` gates are a
// resource concern (see RESOURCE_AUTH_KEYS above) and are rejected here rather than silently dropped.
export function crudBlocks(opts) {
  const cfg = crud(opts) // validates `table`
  const authKey = RESOURCE_AUTH_KEYS.find((k) => cfg[k] !== undefined)
  if (authKey) {
    throw new Error(
      `crudBlocks: \`${authKey}\` is a resource-level authorization option and is NOT enforced on a ` +
        `crudBlocks() page — the block descriptors are serializable and would silently drop it, shipping ` +
        `rows unscoped/ungated. Declare an enforced resource instead: ` +
        `defineCrud('${cfg.table}', { ${authKey}: ... }).`,
    )
  }
  // Collapse the column()/display()/field() BUILDERS in a refinement array to plain specs (shared
  // `plainSpecs`), so the block descriptor stays serializable: it rides in a section's `props`,
  // which Vike serializes to the client, and a builder carries function methods (.sortable(),
  // .build()) that can't cross that boundary. resolve.js accepts either a builder or a plain spec.
  const plain = plainSpecs
  // A view-level `slots: { field: token }` map is plain, serializable data (string tokens,
  // not components), so it rides into each block descriptor and the field derivation reads it.
  const slots = cfg.slots ? { slots: cfg.slots } : {}
  return [
    { block: 'list', table: cfg.table, ...slots, ...(cfg.list ? { list: plain(cfg.list) } : {}) },
    { block: 'record', table: cfg.table, ...slots, ...(cfg.record ? { record: plain(cfg.record) } : {}) },
    { block: 'form', table: cfg.table, ...slots, ...(cfg.form ? { form: plain(cfg.form) } : {}) },
  ]
}
