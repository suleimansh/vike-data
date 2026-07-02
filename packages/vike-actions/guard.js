// Authorizing an action — "who can run this". Default-open (an action with no `guard` runs for
// anyone), matching the family's canView/canEdit default; a guard refines downward. A guard composes
// the EXISTING auth primitives rather than inventing a new model — you write a predicate that calls
// vike-rbac (`can`/`requireRole`), the owner contract (a `scope` check), or reads `ctx.user`
// directly, so vike-actions stays free of a hard dep on any one of them.
//
// A `guard` is one of:
//   - a function `(ctx) => boolean | Promise<boolean>`   — allow when truthy
//   - an array of the above                              — AND (every one must pass)
//   - the string 'authed'                                — a shorthand for "requires a signed-in user"

// A named shorthand -> predicate. Only 'authed' for now; kept as a table so more can be added
// without touching runGuard.
const NAMED = {
  authed: (ctx) => !!ctx.user,
}

function toPredicate(guard) {
  if (typeof guard === 'function') return guard
  if (typeof guard === 'string') {
    const fn = NAMED[guard]
    if (!fn) throw new Error(`vike-actions: unknown named guard "${guard}" (known: ${Object.keys(NAMED).join(', ')})`)
    return fn
  }
  throw new Error('vike-actions: a guard must be a function or a known guard name')
}

// Resolve + run a guard against the action context. No guard -> allowed. An array is AND-merged and
// short-circuits on the first denial. Returns a plain boolean.
export async function runGuard(guard, ctx) {
  if (guard == null) return true
  const predicates = (Array.isArray(guard) ? guard : [guard]).map(toPredicate)
  for (const predicate of predicates) {
    if (!(await predicate(ctx))) return false
  }
  return true
}
