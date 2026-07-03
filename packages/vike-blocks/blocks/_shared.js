// Shared pure-logic helpers for the block builders + resolvers, so the same
// option/query/key/clamp/placement rules live once instead of being re-handwritten
// per block. Framework-agnostic, no imports — just small pure functions.

// One option's canonical shape: label defaults to the value; carry `disabled` only
// when it's set (and only for blocks that support a disabled option, e.g. select).
export const normalizeOption = (o, { withDisabled = false } = {}) => ({
  value: o.value,
  label: o.label ?? o.value,
  ...(withDisabled && o.disabled ? { disabled: true } : {}),
})

// A list of options through normalizeOption (the resolve-side pass-through).
export const resolveOptions = (list, opts) => (list ?? []).map((o) => normalizeOption(o, opts))

// Clamp n into [lo, hi].
export const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi)

// Resolve a key against a known-values map: keep it when known, else `dflt`.
export const keyResolver = (map, dflt) => (x) => (map[x] ? x : dflt)

// Like keyResolver, but first fold aliases (warn -> warning, ...) before the guard.
export const aliasedKeyResolver = (aliases, map, dflt) => (x) => {
  const key = aliases[x] ?? x
  return map[key] ? key : dflt
}

// Normalize a free-text filter query: coerce to string, trim, lowercase.
export const normalizeQuery = (q) => String(q ?? '').trim().toLowerCase()

// Up-to-two initials from a name: first+last initial for a full name, the first
// letter for a mononym, '' for nothing. The conventional avatar form.
export function initials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// The shared calendar descriptor: `date-picker` is a `calendar` in a popover and
// carries the exact same config, so both read one refine map + build fn (date-picker
// adds only `placeholder`).
export const calendarBuild = (value) => (value !== undefined ? { value } : {})
export const calendarRefine = {
  value: (v) => ({ value: v }),
  month: (m) => ({ month: m }),
  min: (v) => ({ min: v }),
  max: (v) => ({ max: v }),
  weekStartsOn: (n) => ({ weekStartsOn: n === 1 ? 1 : 0 }),
  name: (n) => ({ name: n }),
}

// Coerce a placement side/align to a legal value, shared by a block's fluent builder
// AND its resolve step so a raw serialized prop and a fluent-built value validate
// identically (resolve is authoritative; the builder mirrors it).
export const normalizeSide = (s, allowed, dflt) => (allowed.includes(s) ? s : dflt)
export const normalizeAlign = (a) => (a === 'end' ? 'end' : 'start')
