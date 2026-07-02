// The form-field dispatcher now lives in vike-crud/vue (vike-admin is a preset over vike-crud);
// this re-export keeps the admin's create/edit pages importing `./FormFields.js` unchanged, and
// routes them through the SHARED Vue field-widget registry instead of an inline v-if switch. So an
// extension's Vue control (e.g. vike-storage's `file` widget) now renders in the admin form too.
// Mirrors vike-admin/react/FormFields.jsx.
export { FormFields } from 'vike-crud/vue/FormFields'
