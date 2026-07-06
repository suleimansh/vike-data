// vike-admin speaks the vike-crud resource API directly now. `defineResource` (the object-signature
// CRUD-per-table declaration) and the column / display / field builders live in vike-crud's core;
// this module is a pure re-export so an admin resource is authored with the exact same helpers a
// per-page vike-crud resource is. The screen vocabulary (index / view / edit, with create aliasing
// edit) and the schema-derived list / record / form are all vike-crud's — admin's data layer reads
// the same resource shape it introspects for a per-page mount.
export { defineResource } from 'vike-crud'
export { column, display, field } from 'vike-crud/define'
