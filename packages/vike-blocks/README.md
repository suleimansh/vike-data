# vike-blocks

Composable UI as data. The framework-agnostic substrate for building a page out of **blocks**
— a block descriptor IR, an open registry, the `definePage` composer, the built-in primitive
blocks, and the `defineBlock` seam so any package can ship a new block with high DX.

`vike-crud` layers schema-driven blocks (list / record / form derived from your data schema)
on top of this; a per-framework package (e.g. a React renderer) draws the blocks.

## A page is a composition of blocks

```js
import { definePage, heading, badge, divider, link } from 'vike-blocks'

definePage({
  route: '/dashboard',
  sections: [
    heading('Welcome'),
    { block: 'stat',     title: 'Revenue', source: 'orders.sum(total)' },
    { block: 'markdown', source: '# Notes' },
    badge('Beta').tone('info'),
    divider(),
    link('Docs').to('/docs'),
    { block: 'custom',   component: 'MyChart' }, // your own component
  ],
})
```

`resolvePage(page, tables)` turns the block descriptors into plain, serializable view-models a
renderer draws (`{ block, props, resolved }` per section). A bespoke block echoes its props; a
schema-derived block (registered by vike-crud) fills its `columns`/`fields` from the schema.

## Built-in block catalog

All built-ins are theme-native (colors and radius read vike-themes `var(--color-*)` / `--radius`)
and render the same in React and Vue over one IR. Each has a live demo in `examples/vike-blocks`.

**Leaf blocks** (fluent builders, a pass-through view-model):

```js
import { heading, text, badge, divider, link, button, alert } from 'vike-blocks'

heading('Title').level(2)                 // <h1>..<h6>, top margin scales with the level
text('Body copy').tone('muted')           // muted / danger / success / info, or theme text
badge('Beta').tone('info')
divider()
link('Docs').to('/docs')
button('Save').variant('primary').size('md').to('/back')   // primary/secondary/ghost/danger; .to renders an <a>
alert('Heads up').intent('warning').body('Your trial ends in 3 days.')  // info/success/warning/danger
```

**Container blocks** (interactive, hold a nested composition of blocks, resolved recursively;
which is open is local UI state in the renderer):

```js
import { tabs, accordion, dialog, heading, text, button } from 'vike-blocks'

tabs()
  .tab('account', 'Account', [heading('Account').level(3), text('Your profile.')])
  .tab('password', 'Password', [text('Change your password.')])
  .defaultValue('account')                // sliding highlight + measured height morph, pure CSS

accordion()
  .item('shipping', 'Shipping', [text('Ships in 2-3 days.')])
  .item('returns', 'Returns', [text('30-day returns.')])
  .multiple()                             // omit for single-open (default)
  .defaultValue(['shipping'])             // initial open item(s)

dialog()
  .title('Delete post')
  .description('This cannot be undone.')
  .trigger('Delete')                      // the opening button's label
  .sections([text('Are you sure?')])
  .footer([button('Cancel').variant('ghost'), button('Delete').variant('danger')])
  // dep-free portal + backdrop + focus trap + Escape / outside-click + scroll-lock, CSS enter/exit
```

**Layout** (a container whose named regions are page structure — layouts collapse into the same
block IR, #401). A `variant` picks a swappable shell (`landing` / `centered` / `stack`); a `slot`
is a first-class placeholder whose `from` names its fill source, so app chrome (`from: 'config'`,
read from a cumulative contribution at render time — the vike-layouts seam) and page content
(`from: 'children'`, the default) share one model:

```js
import { layout, slot, heading, text, button } from 'vike-blocks'

layout('landing')
  .slot('header', [slot('nav').from('config'), button('Sign in')]) // nav comes from config, not inlined
  .slot('main', [heading('Ship faster').level(1), text('...')])
  .slot('footer', [text('(c) Acme')])
```

**Bespoke pass-throughs** (the renderer draws them from their props): `stat` (`{ title, source|value }`),
`markdown` (`{ source }`), `custom` (`{ component }`, your own component). vike-crud registers the
schema-derived blocks (`list` / `record` / `form`) into the same registry.

### Full catalog

Every built-in builder, by group. Each imports from `vike-blocks` and has a live demo in
`examples/vike-blocks`. The renderers (React and Vue) register automatically when you import
`vike-blocks/react` or `vike-blocks/vue`.

| Group | Blocks |
|---|---|
| Primitives | `text` `heading` `badge` `divider` `link` `list` |
| Content | `markdown` `code` |
| Buttons | `button` |
| Form controls | `input` `textarea` `checkbox` `radio` `select` `combobox` `tagInput` `toggle` `toggleButton` `toggleGroup` `slider` `calendar` `datePicker` `attachment` `rating` |
| Form structure | `field` `form` |
| Data display | `table` `dataTable` `chart` `pagination` `stat` `timeline` `descriptionList` |
| Feedback | `alert` `skeleton` `progress` `spinner` `tooltip` `emptyState` |
| Overlays | `dialog` `confirm` `sheet` `drawer` `popover` `dropdown` `navMenu` `contextMenu` |
| Navigation | `breadcrumb` `docNav` `command` `tabs` `accordion` `collapsible` `tree` |
| Identity + misc | `avatar` `avatarGroup` `kbd` `item` |
| Chat | `bubble` `message` `messageScroller` |
| Containers + layout | `card` `layout` `slot` `stepper` |
| Escape hatch | `custom` |

`toast` is not in the table because it is not a `sections` block — it is an imperative API you
fire from an event: `import { toast } from 'vike-blocks'; toast('Saved', { intent: 'success' })`,
rendered by a `<Toaster>` you mount once (from `vike-blocks/react` or `/vue`).

## The open registry + `defineBlock`

Blocks live in an open registry — add one with `registerBlock(type, { resolve })`, or, for a
leaf block with a fluent builder, `defineBlock`:

```js
// vike-block-rating (a third-party package) — the agnostic half, one call
import { defineBlock } from 'vike-blocks'

export const rating = defineBlock('rating', {
  build:  (value) => ({ value }),                       // rating(3) -> { block:'rating', value:3 }
  refine: { max: (n) => ({ max: n }), readonly: () => ({ readonly: true }) },
  params: [{ name: 'value', required: true }],          // optional: describeBlock discovery
})
// author usage:  rating(3).max(5).readonly()
```

```js
// vike-block-rating/react — the renderer half, per framework
// (`registerBlockRenderer` lives in vike-blocks/react, the React binding.)
import { registerBlockRenderer } from 'vike-blocks/react'
registerBlockRenderer('rating', Rating)
```

Define once (builder + descriptor + registry entry), render once per framework. The built-in
blocks (`text`/`heading`/`badge`/`divider`/`link`/`list`) are defined through this same seam, so
your custom block is a peer, not a special case.

### Discover the catalog programmatically

Because a page is data, the catalog is introspectable — tools and AI agents can enumerate every
block and learn how to compose it without reading source:

```js
import { listBlocks, describeBlock, describeBlocks, blockCatalog } from 'vike-blocks'

listBlocks()             // ['text', 'heading', 'rating', 'form', ...]
describeBlock('dialog')  // { type:'dialog', category:'overlay', summary:'A modal dialog ...',
                         //   container:true, passThrough:false, builder:null, params:null,
                         //   example:"dialog().title('Delete post').trigger('Delete').sections([...])" }
describeBlocks()         // the whole catalog as descriptors
```

Each descriptor carries: `category` (grouping for selection), `summary` (one line), `container`
(true when it nests sections), `passThrough` (false when the block has a `resolve` step and is
schema/data-aware), `builder` (`methods` are the chainable refinements, `arity` the positional
args), `params` (author-declared `{ name, required, type, enum }`), and a copy-pasteable `example`.
`category`/`summary`/`example`/`params` are optional metadata a block declares via `defineBlock`.

#### The agent contract — `blockCatalog()`

`blockCatalog()` returns the whole catalog as one versioned, JSON-serializable object — the stable
seam an AI agent (or an MCP tool) consumes to compose a page from blocks without importing any
vike-blocks internals:

```js
blockCatalog()
// { contractVersion: 1, blocks: [ /* one describeBlock() descriptor per registered type */ ] }
```

Guard on `contractVersion` (exported as `CATALOG_CONTRACT_VERSION`); it bumps only when the
descriptor shape changes in a breaking way.

## Rendering — `vike-blocks/react` (and `/vue`)

> `vike-blocks/vue` is the exact Vue twin — same `registerBlockRenderer` + `<Blocks>`/`<Page>` + primitive components, over the shared `blocks`/`vue` registry slot.


The React binding ships the dispatch and the primitive components. `<Blocks>` draws already
resolved sections; `<Page>` resolves a view first. Each block type maps to its registered
component (via the shared registry), which receives the block's serializable `resolved` model:

```jsx
import { Page } from 'vike-blocks/react'          // + 'vike-crud/react' to render list/record/form
import { definePage, crudBlocks, heading } from 'vike-crud'

const view = definePage({ sections: [heading('Posts'), ...crudBlocks({ table: 'posts' })] })
// <Page page={view} tables={tables} /> -> the schema drives the table columns, record fields,
// and form controls (an enum column renders a <select>, a required column is marked, ...).
```

`resolved` is plain data (a schema block's `columns`/`fields`, a bespoke block's props), so it
serializes cleanly into the client hydration payload. A block type with no registered renderer
is skipped, so a page degrades gracefully.

## Package layout

```
vike-blocks/
  index.js        the agnostic barrel: definePage/resolvePage, the registry, every builder
  core/           the framework-agnostic IR: registry, page composer, params, primitives  (see core/README.md)
  blocks/         one <name>.js builder (+ optional <name>-styles.js) per built-in block   (see blocks/README.md)
  react/          the React binding: registerBlockRenderer, <Blocks>/<Page>, the renderers
  vue/            the Vue twin of react/
  test/           node --test coverage for the builders + resolve
```

`core/` and `blocks/` never import from a framework; `react/` and `vue/` import the shared
builders and `-styles.js` data so the two renderers can't drift. See `blocks/README.md` for the
recipe to add a block.

## The escape hatch

The genuine long tail that no block expresses drops to `block: 'custom'` (your component) or an
AI-ejected real page. There is deliberately **no** layout / expression / data-binding DSL —
that's the low-code trap this avoids.
