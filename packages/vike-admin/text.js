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
