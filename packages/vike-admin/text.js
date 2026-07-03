// Small framework-agnostic text helpers shared by the admin pages (React + Vue), so the
// New/Edit headings read the same in both.

// A rough singular of a resource label for a page heading ("Posts" -> "Post"). Case-insensitive,
// null-safe; leaves a non-plural word untouched.
export function singular(word) {
  return word && /s$/i.test(word) ? word.replace(/s$/i, '') : word
}
