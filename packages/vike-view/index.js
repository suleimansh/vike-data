// Programmatic surface of vike-view — the schema-driven layer over vike-blocks. It
// re-exports the vike-blocks substrate (the composer, registry, defineBlock, and the
// primitive blocks) as a convenience umbrella, and adds the schema layer: crud derivation,
// the list/record/form blocks, and `defineView`. Importing anything here registers the
// schema-derived blocks. No React, no Vike.
export { definePage, resolvePage, registerBlock, getBlock, hasBlock, listBlocks, defineBlock, text, heading, badge, divider, link } from 'vike-blocks'
// `resolveView` is the schema-app's name for the generic `resolvePage` (kept for continuity).
export { resolvePage as resolveView } from 'vike-blocks'
export { defineView } from './view.js' // side-effect: registers list / record / form
export { crudBlocks } from './schema-blocks.js'
export { crudActions } from './actions.js' // register owner-scoped create/update/delete actions for a table
export { crud, column, display, field } from './define.js'
export {
  resolveViewTables,
  tableNamed,
  viewLabel,
  canView,
  canEdit,
  buildDb,
  viewColumns,
  viewRecord,
  viewFields,
  recordTitleColumn,
  isHiddenColumn,
  titleCase,
  fkOf,
} from './resolve.js'
export { projectRow } from './project.js'
export { parseListQuery, QueryError, MAX_LIMIT } from './query.js'
// The server-side data layer: fill a view's blocks with rows/values, and the scoped write path.
export { hydrateView, createRow, updateRow, deleteRow, rowFromForm } from './data.js'
// Customization tier 3: eject a view to plain, owned source (page + data hook), no page-gen.
export { ejectView, routeToSlug } from './eject.js'
