// The built-in BESPOKE blocks — pass-throughs whose view-model is just their props (the
// renderer draws them). The schema-derived blocks (list/record/form) are NOT here: they live
// in vike-crud, which registers them into this same registry. The fluent leaf blocks
// (text/heading/badge/divider/link/code/markdown) are registered by their own modules through defineBlock.
import { registerBlock } from './registry.js'

registerBlock('stat', {
  category: 'data',
  summary: 'A single key metric with a title and a value (or a data source).',
  example: "{ block: 'stat', title: 'Revenue', value: '$12k' }",
}) // { title, source|value }
registerBlock('custom', {
  category: 'escape-hatch',
  summary: 'Renders your own component by name; the escape hatch for the long tail.',
  example: "{ block: 'custom', component: 'MyChart' }",
}) // { component } — the renderer imports the component
