// The view DSL lives in vike-crud's framework-agnostic core; `defineResource` is vike-admin's
// name for the CRUD-per-table view (vike-crud calls the primitive `crud`). It speaks the same
// SCREEN vocabulary as `defineCrud` — `index` / `view` / `edit` — so a table reads the same in an
// admin resource as in a per-page resource:
//
//   defineResource({
//     table: 'posts',
//     index: [ column('title').sortable() ],   // the list screen
//     view:  [ display('title'), display('body') ], // the read-only detail screen
//     edit:  [ field('title').required() ],     // the create + edit form (admin renders one form;
//                                               //   `create` is accepted as an alias for it)
//     query, onCreate, canIndex, canView, ...   // the defineCrud auth model (#581)
//   })
//
// Under the hood these map onto the block keys vike-crud's `crud` + resolve read (index -> list,
// view -> record, edit/create -> form). `column` / `display` / `field` are the same builders.
import { crud, column, display, field } from 'vike-crud/define'

export { column, display, field }

// Translate the `index/view/edit` screen vocabulary onto the `list/record/form` block keys the
// core reads. `create` is an alias for `edit` (admin renders a single form; create inherits edit,
// matching defineCrud). `table` and the rest (label / recordTitle / icon / query / onCreate / canX)
// pass through untouched.
export function defineResource(def = {}) {
  if (!def || typeof def !== 'object' || Array.isArray(def)) return crud(def) // let crud throw its clear error
  // Destructure the old block keys too, so they DON'T pass through — the screen vocabulary is the
  // single authoring surface (no `list`/`record`/`form` back-door alongside `index`/`view`/`edit`).
  const { index, view, create, edit, list: _l, record: _r, form: _f, ...rest } = def
  const form = edit ?? create
  return crud({
    ...rest,
    ...(index !== undefined ? { list: index } : {}),
    ...(view !== undefined ? { record: view } : {}),
    ...(form !== undefined ? { form } : {}),
  })
}
