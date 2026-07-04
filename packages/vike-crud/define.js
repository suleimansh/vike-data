// The `crud` preset — the built-in CRUD view for a table: derive its list / record / form
// screens from the composed schema. It is ONE preset over the general view primitive
// (`definePage({ route, sections })`, which composes blocks); `crud({ table })` is the sugar
// that emits the list/record/form blocks for a table, the 80% case. The schema is the
// intent, the UI is derived, and a crud view only declares what differs from that default.
//
// The minimal case is `crud({ table: 'posts' })` — every column derives from the schema,
// full list + record + form. You reach for `list`/`record`/`form` and the `column()` /
// `display()` / `field()` builders only to refine: pick/rename/order columns, mark a
// field's input type, gate with `canView` / `canEdit`, scope to owned rows.
//
// The builders are deliberately FLAT (`field('x').type('select')`, not a per-type
// subclass). `.build()` collapses a builder to a plain spec; resolve.js calls it, so a
// view author can pass either a builder or a bare spec object.

// A list column: how a schema column appears in the list table.
export function column(name) {
  const spec = { name }
  const self = {
    sortable() {
      spec.sortable = true
      return self
    },
    searchable() {
      spec.searchable = true
      return self
    },
    label(text) {
      spec.label = text
      return self
    },
    // A named, client-applied formatter (e.g. 'since' for a relative timestamp). A
    // string token, not a function, so the resolved column stays serializable to the
    // client. Unknown tokens render the raw value.
    format(token) {
      spec.format = token
      return self
    },
    // Slot override (tier 2): render this column's cell with your own registered
    // component instead of the derived one. A string TOKEN (register the component with
    // `registerFieldWidget(token, Cmp)`), not a function, so the column stays
    // serializable. The cell component gets `{ field, value, row }`.
    slot(token) {
      spec.slot = token
      return self
    },
    build() {
      return { ...spec }
    },
  }
  return self
}

// A record (detail) field: how a schema column appears as a read-only cell on the record
// view. Same refinements a list column carries that make sense for read-only display
// (label + format); no sortable/searchable (a detail page shows one row).
export function display(name) {
  const spec = { name }
  const self = {
    label(text) {
      spec.label = text
      return self
    },
    format(token) {
      spec.format = token
      return self
    },
    // Slot override (tier 2): render this field's value with your own registered
    // component instead of the derived cell. A string TOKEN; the component gets
    // `{ field, value, row }`.
    slot(token) {
      spec.slot = token
      return self
    },
    build() {
      return { ...spec }
    },
  }
  return self
}

// A form field: how a schema column appears as an input in the create/edit form.
export function field(name) {
  const spec = { name }
  const self = {
    // Override the input type the schema would infer (e.g. `.type('email')` on a
    // string column, `.type('select')` later). Flat for now.
    type(inputType) {
      spec.type = inputType
      return self
    },
    label(text) {
      spec.label = text
      return self
    },
    required(isRequired = true) {
      spec.required = isRequired
      return self
    },
    // Slot override (tier 2): render this field's INPUT with your own registered control
    // instead of the derived widget. A string TOKEN (register with
    // `registerFieldWidget(token, Cmp)`); the control gets the widget contract
    // `{ field, value }`.
    slot(token) {
      spec.slot = token
      return self
    },
    build() {
      return { ...spec }
    },
  }
  return self
}

// Declare a CRUD view for a table. `table` (a table in the COMPOSED schema, not a Model
// class) is the only required field; everything else refines the schema-derived default.
//
//   crud({
//     table: 'posts',
//     label: 'Posts',
//     list:   [ column('title').sortable(), column('status').slot('status-badge') ],
//     record: [ display('title'), display('body'), display('author') ],
//     form:   [ field('title').required(), field('body'), field('status').type('select') ],
//     // Slot overrides (tier 2): a view-level map from field name -> a registered component
//     // token, applied across list/record/form. A per-field `.slot()` above wins over this.
//     slots:  { author: 'author-chip' },
//     canView: (user) => !!user,
//     canEdit: (user) => user?.role === 'admin',
//     // Row scoping (#104): bound a user to their OWN rows. The contract is `(table, ctx) ->`
//     // filter (ctx carries `user`); return a universal-orm filter, or a falsy value for full
//     // access (encode the admin bypass here). AND-merged into list/load/update/delete, forced
//     // onto inserts. NOTE canView/canEdit above take `(user)`; scope takes `(table, ctx)`.
//     scope: (table, ctx) => (ctx.user?.role === 'admin' ? null : { user_id: ctx.user.id }),
//   })
export function crud(def) {
  if (!def || typeof def !== 'object') {
    throw new Error('crud: expected a definition object, e.g. crud({ table: "posts" })')
  }
  if (typeof def.table !== 'string' || !def.table) {
    throw new Error('crud: `table` (a table name in the composed schema) is required')
  }
  return { icon: null, ...def }
}

// The block each CRUD screen renders, and the refinement key it reads. The page vocabulary is
// index / view / create / edit; the block names stay list / record / form (view renders the
// read-only `record` block, create + edit share the `form` block). This map is the single place
// the two vocabularies meet.
export const SCREEN_BLOCK = {
  index: { block: 'list', refine: 'list' },
  view: { block: 'record', refine: 'record' },
  create: { block: 'form', refine: 'form' },
  edit: { block: 'form', refine: 'form' },
}

// Collapse column()/display()/field() builders in a refinement array to plain, serializable specs
// (a builder carries function methods that can't cross the client boundary). resolve.js accepts
// either, so a hand-authored view may also pass bare specs. Undefined stays undefined (= derive all).
export const plainSpecs = (arr) => (arr == null ? undefined : arr.map((e) => (typeof e?.build === 'function' ? e.build() : e)))

// One CRUD screen as a serializable block descriptor: `{ block, table, [refineKey]: specs }`. The
// shared building block behind `crud.<screen>()` and the `defineCrud` expander.
export function screenBlock(screen, table, specs) {
  const map = SCREEN_BLOCK[screen]
  if (!map) throw new Error(`screenBlock: unknown screen "${screen}"`)
  const refined = plainSpecs(specs)
  return { block: map.block, table, ...(refined ? { [map.refine]: refined } : {}) }
}

// Per-screen sugar: the block(s) for one screen, as a section array to spread into a page, e.g.
// `definePage({ route: '/posts', sections: crud.index('posts') })`. This is the primitive tier the
// `defineCrud` resource sugar expands into (and what `eject` reveals).
crud.index = (table, columns) => [screenBlock('index', table, columns)]
crud.view = (table, fields) => [screenBlock('view', table, fields)]
crud.create = (table, fields) => [screenBlock('create', table, fields)]
crud.edit = (table, fields) => [screenBlock('edit', table, fields)]
