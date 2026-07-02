# vike-crud

Schema-driven views (list / record / form) for any framework. The composed schema is the
source of truth; a thin `definePage` config refines it; per-framework renderers draw it.

This package is the **schema layer over [`vike-blocks`](../vike-blocks)**: it derives a
plain, serializable view-model from the merged schema and registers `list`/`record`/`form`
blocks into vike-blocks' registry, so a page can compose them. vike-blocks owns the
generic substrate (the block IR, the `definePage` composer, the registry + `defineBlock`
seam, the primitive blocks); vike-crud adds the data-driven blocks on top. No React, no
Vue, no Vike. "Declare intent, derive implementation."

## The three views, all derived from schema

| View | Derived from | Gives you |
|---|---|---|
| **List** | table + field types | columns, sort/search flags, formatting |
| **Record** | one row + relations | read-only detail display, FK-aware cells |
| **Form** | field types + validation | inputs, relation selects, required-ness |

## The view is a UI schema

A page is a **composition of blocks** (the UI/UX schema — see vike-blocks). `definePage` is
vike-crud's schema-flavored entry to the `definePage` composer: importing it registers the
schema-derived blocks (`list`/`record`/`form`), so they resolve out of the box alongside the
bespoke ones (`stat`/`markdown`/`custom`) and the fluent blocks. The genuine long tail ejects
to a real component / an AI-generated page rather than growing more config knobs.

```js
import { definePage, crudBlocks } from 'vike-crud'

// A page composed of blocks; list/record/form derive from the schema.
definePage({
  route: '/dashboard',
  sections: [
    { block: 'stat',     title: 'Revenue', source: 'orders.sum(total)' },
    { block: 'list',     table: 'orders' },        // schema-derived
    { block: 'markdown', source: '# Welcome' },
    { block: 'custom',   component: 'MyChart' },    // your own component
    ...crudBlocks({ table: 'posts' }),              // the crud preset: list + record + form
  ],
})
```

`resolveView(view, tables)` (which is vike-blocks' `resolvePage` re-exported — importing it
from vike-crud is what guarantees the schema blocks are registered) turns those descriptors
into serializable view-models a renderer draws: a schema-derived block fills its
`columns`/`fields` from the schema (through the same crud engine), a bespoke block echoes its
props. The registry is open — an app or extension adds a block with
`registerBlock('gauge', { resolve })`, so a new block type ships with the component that
renders it. The genuine long tail drops to `block: 'custom'` or an AI-ejected
page; there is deliberately no layout/expression DSL.

`crud({ table })` (below) is the schema-derived CRUD preset; `crudBlocks({ table })` expands
it into the three `list`/`record`/`form` block descriptors for a page.

## Primitive blocks — fluent leaf builders

For the non-schema bits of a page, author leaf blocks fluently with the block builders from
vike-blocks (re-exported here for convenience). Same pattern as `column()`/`field()`, one
level up — a lowercase factory that `.build()`s to a plain block descriptor:

```js
import { definePage } from 'vike-crud'
import { heading, text, badge, divider, link } from 'vike-blocks'

definePage({
  route: '/posts/@id',
  sections: [
    heading('Post').level(2),
    { block: 'record', table: 'posts' },
    badge('Draft').tone('warning'),
    divider(),
    link('Back to posts').to('/posts'),
  ],
})
```

Display-only today (`text` / `heading` / `badge` / `divider` / `link`). Interactivity — a
button that *does* something — is a separate axis: behavior can't be an inline closure in
serializable config, so it's being scoped on its own (see the vike-actions investigation).
`link().to(path)` covers declarative navigation in the meantime.

## `crud` — the built-in CRUD preset

```js
import { crud, column, display, field } from 'vike-crud'

crud({
  table: 'posts',                                    // a table in the composed schema
  list:   [column('title').sortable(), column('created_at').format('since')],
  record: [display('title'), display('body'), display('author_id')],
  form:   [field('title').required(), field('status').type('select')],
  canView: (user) => !!user,
  canEdit: (user) => user?.role === 'admin',
  scope:  (user) => (user?.role === 'admin' ? null : { user_id: user.id }), // row scoping (#104)
})
```

Everything is optional except `table` — omit `list`/`record`/`form` and each is derived
from the schema (every non-hidden column). `id`, `*_hash`, and the `created_at`/`updated_at`
timestamps are hidden by convention.

## Deriving the view-model

```js
import { resolveViewTables, tableNamed, viewColumns, viewRecord, viewFields, buildDb } from 'vike-crud'

const tables = resolveViewTables(config)          // merge the cumulative `schemas` point
const table = tableNamed(tables, 'posts')
const columns = viewColumns(view, table)          // list columns
const detail  = viewRecord(view, table)           // read-only record fields (FK-aware)
const fields  = viewFields(view, table)           // form fields (required, selects, options)
const db = buildDb(tables)                         // a universal-orm repository on the app adapter
```

Field widgets follow the column's semantic hint (`.as('email')`, `.as('enum')`, `.as('date')`)
so one schema declaration drives a rich control, with the storage type kept as the coercion
token. A foreign key becomes a select whose options a data hook fills from the referenced table.

`projectRow` is the shared allow-list that keeps hidden columns from leaving the server;
`parseListQuery` validates a `?query=` (filter / orderBy / limit / offset) against a view's
columns before it reaches the database.

## Customization — config → slots → eject

You start with a generated view and refine only where reality demands it:

1. **Config** (tier 1) — pick / rename / order columns, mark widgets, filters, default sort via `crud` + the `column()` / `display()` / `field()` builders.
2. **Slot overrides** (tier 2) — drop your own component for ONE field/column, keeping the rest generated. A per-field `.slot(token)` or a view-level `slots: { name: token }` map:

   ```js
   import { registerFieldWidget } from 'vike-crud/react/widgets' // or /vue/widgets

   registerFieldWidget('status-badge', StatusBadge) // component gets { field, value, row }

   crud({
     table: 'posts',
     list: [column('title'), column('status').slot('status-badge')],
     form: [field('body').slot('rich-editor')],   // a slot on a form field is your own CONTROL
     slots: { author: 'author-chip' },             // or a map by field name, applied across list/record/form
   })
   ```

   The token is a string (register the component with `registerFieldWidget`), so the block descriptor stays serializable — the same register-by-name pattern as the `custom` block. An unregistered token falls back to the derived cell/control, so a typo degrades gracefully. Register the component from a module the page imports so it runs on both the server (SSR) and the client (hydration).
3. **Eject** (tier 3) — when you outgrow config + slots, `ejectView(view)` hands you the whole page as plain, owned source and steps out of the way. No more generated `ViewPage` / `viewData` / `views` config dispatch: the view descriptor, the row-scope, and the read/write path are written into files in your own page folder, and nothing regenerates them.

   ```js
   import { ejectView } from 'vike-crud/eject'

   const { files } = ejectView(view, { framework: 'react' }) // or 'vue'
   // -> [{ path: 'pages/posts/+data.js',  source },   // data hook: view inlined, scope + write path
   //     { path: 'pages/posts/+Page.jsx', source }]   // page: renders the sections through <Blocks>
   for (const f of files) await writeFile(f.path, f.source)
   ```

   It leans on two guarantees of the block IR: a view's `sections` are serializable block descriptors (so they emit as an editable literal you own) and its `scope` is a real function (so its source is emitted verbatim — you get your exact owner predicate back, not a stub). The output is a real starting point to grow, not a pre-exploded component tree you would have to reconcile on the next edit; swap `<Blocks>` for explicit `<ListView/>` / `<FormView/>` as you go. See `examples/vike-crud/pages/posts-ejected/` for committed output.

For a whole SECTION (not a field), compose a `{ block: 'custom', component }` in place of the generated `list`/`record`/`form` instead of a slot.

## Data — `vike-crud/data`

`resolveView` gives structure; `hydrateView` fills in the data, server-side:

```js
import { hydrateView, buildDb, resolveViewTables, createRow } from 'vike-crud'

const tables = resolveViewTables(config)
const db = buildDb(tables)               // universal-orm repository on the app's adapter
const scope = (table, ctx) => ({ user_id: ctx.user.id })  // row scoping (#104), request-time

const hydrated = await hydrateView(view, { tables, db, scope, ctx, search })
// -> a `list` block now has resolved.rows (paged, scoped) + resolved.fkLabels;
//    a `record` block (with an id) has resolved.row. Hand it to <Blocks>.
```

The write path — `createRow` / `updateRow` / `deleteRow` — coerces a submitted form, fills a
primary key, and enforces the same scope on writes (a forged owner field is overwritten; an
id-guess for another owner's row matches nothing). Scope stays a request-time function, so a
predicate never serializes to the client.

## Rendering — `vike-crud/react` (and `/vue`)

> `vike-crud/vue` is the exact Vue twin — `ListView` / `RecordView` / `FormView` self-registered for list/record/form, over the shared Vue field-widget registry. Same import shape (`import { Page } from 'vike-crud/vue'`).


Importing `vike-crud/react` registers the schema renderers (`ListView` / `RecordView` /
`FormView`) into vike-blocks' block-renderer registry and re-exports the `<Blocks>` / `<Page>`
dispatch, so one import renders a schema page:

```jsx
import { Page } from 'vike-crud/react'
import { definePage, crudBlocks, resolveViewTables } from 'vike-crud'

const tables = resolveViewTables(config)
const view = definePage({ route: '/posts', sections: crudBlocks({ table: 'posts' }) })
// <Page page={view} tables={tables} /> -> list + record + form, derived from the schema.
```

`FormView` derives each control from the field's widget/type (an `enum` column becomes a
`<select>`, a required column is marked, a boolean becomes a checkbox). List rows and record
values are supplied by the data layer (the MVP-proof wiring); the renderer draws the structure.

## Relationship to vike-admin

`vike-admin` is a **preset over vike-crud**: it wires these derivations to a whole-DB
`/admin/*` panel with pages, guards, and a JSON API. Reach for vike-crud directly to render
a single table's screens at your own routes.
