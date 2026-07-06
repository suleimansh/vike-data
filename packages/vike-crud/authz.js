// The authorization primitives for a defineCrud resource: the read-scope `query` builder, the
// per-field `.when` visibility gate, and the `can*` predicate gate. All are evaluated SERVER-SIDE
// (the `views` config point is server-only), so no predicate ever serializes to the client, and a
// field hidden by `.when` is dropped BEFORE its data leaves the server — never shipped-then-hidden.

// universal-orm's filter surface is narrow ON PURPOSE (#44): equality and `{ in: [...] }`. The
// `query` builder mirrors exactly that — it reads like a query but can only express what the ORM
// can execute: `.where(col, value)`, `.where(col, { in: [...] })`, `.whereIn(col, values)`.
function queryBuilder() {
  const filter = {}
  const q = {
    where(col, value) {
      filter[col] = value && typeof value === 'object' && Array.isArray(value.in) ? { in: value.in } : value
      return q
    },
    whereIn(col, values) {
      filter[col] = { in: values }
      return q
    },
    _filter: filter,
  }
  return q
}

// Run a resource `query(q, ctx)` and return the universal-orm filter it built. Returning the
// builder unrefined (the admin bypass) yields `{}` = unscoped; returning a plain filter object is
// honored as-is. A falsy return is fail-safe: if the builder was touched (a brace-body fn that
// called `.where` but forgot `return q`) its filter is honored, so a missing `return` can't
// silently drop row scoping; only an untouched builder is unscoped.
export function runQuery(query, ctx) {
  if (typeof query !== 'function') return {}
  const q = queryBuilder()
  const out = query(q, ctx)
  if (out === q) return q._filter
  if (out && typeof out === 'object') return out._filter ?? out
  return Object.keys(q._filter).length ? q._filter : {}
}

// Adapt a resource `query(q, ctx)` into the data layer's `scope(table, ctx) -> filter` shape, so
// the existing owner-scoping (AND-merged into reads, forced onto writes) works unchanged.
export function queryScope(query) {
  if (typeof query !== 'function') return undefined
  return (_table, ctx) => runQuery(query, ctx)
}

// Evaluate a predicate gate. A missing predicate means allowed; otherwise the (possibly async)
// predicate must return truthy. `canIndex`/`canCreate` are called `(ctx)`; `canView`/`canEdit`/
// `canDelete` are called `(record, ctx)`.
export async function allow(pred, ...args) {
  if (typeof pred !== 'function') return true
  return !!(await pred(...args))
}

// Drop the fields a per-field `.when(ctx)` predicate hides (keep only when the predicate is truthy),
// and strip the predicate from the survivors so the result is serializable. Applied to list columns
// and record/form fields before they — and any row data projected against them — leave the server.
export function keepVisible(fields, ctx) {
  if (!Array.isArray(fields)) return fields
  return fields.filter((f) => typeof f?.when !== 'function' || !!f.when(ctx)).map(({ when, ...rest }) => rest)
}
