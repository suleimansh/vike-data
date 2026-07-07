// Small framework-agnostic text helpers shared by the admin pages (React + Vue), so the
// New/Edit headings read the same in both.

// A rough singular of a resource label for a page heading ("Posts" -> "Post"). Case-insensitive,
// null-safe; leaves a non-plural word untouched. Handles the common endings a bare `/s$/` strip got
// wrong ("Categories" -> "Category", "Addresses" -> "Address"), and keeps genuine `-ss`/`-us`/`-is`
// singulars intact ("Address", "Status", "Analysis"). Not a full inflector; irregulars fall through.
export function singular(word) {
  if (!word) return word
  const w = String(word)
  if (/[^aeiou]ies$/i.test(w)) return w.replace(/ies$/i, 'y') // Categories -> Category
  if (/(ss|sh|ch|x|z)es$/i.test(w)) return w.replace(/es$/i, '') // Addresses/Boxes -> Address/Box
  if (/(ss|us|is)$/i.test(w)) return w // Address / Status / Analysis: already singular
  return /s$/i.test(w) ? w.replace(/s$/i, '') : w // Posts -> Post
}

// The CrudDialog headings for a resource label ("Posts" -> New Post / Edit Post / Post), shared by
// both renderers (#728). vike-crud's own ViewPage uses the host's generic Details/New/Edit defaults;
// admin names the resource.
export function dialogTitles(label) {
  const one = singular(label)
  return { view: one, create: `New ${one}`, edit: `Edit ${one}` }
}

// The write targets for admin's dialog forms (#728). In dialog mode the forms still POST to the
// existing /admin/:table sub-routes (where the create/update/delete hooks live) - there is no bespoke
// write path - so create -> /admin/:table/new, edit -> /admin/:table/:id/edit, and delete posts
// `_action=delete` to the same edit route. `id` is the active row (null on create). Encoded so a pk
// carrying a space / `/` / `#` / unicode stays a valid path.
export function adminSubmit(table, id) {
  const editTo = id != null ? `/admin/${table}/${encodeURIComponent(String(id))}/edit` : null
  return {
    create: { to: `/admin/${table}/new`, fields: [] },
    ...(editTo ? { edit: { to: editTo, fields: [] }, delete: { to: editTo, fields: [{ name: '_action', value: 'delete' }] } } : {}),
  }
}
