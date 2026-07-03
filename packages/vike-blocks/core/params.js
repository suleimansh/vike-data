// Resolving a block's `params` against the data around it — turning a serializable token like
// `$row.id` into the actual value. A value in a params object is either a literal (passed through)
// or a `$scope.path` TOKEN that reads from a named context bucket (`{ row, record, ... }`). This
// lives in vike-blocks because params ride on block descriptors (an action button, a table row
// action); vike-actions re-exports it so the client runner and the block renderers share ONE
// resolver. No closures ever live in params — that's the whole point.
//
//   resolveParams({ id: '$row.id', status: 'published' }, { row: { id: 7 } })  ->  { id: 7, status: 'published' }

// Read a dotted path off an object, or undefined if any segment is missing.
function readPath(obj, path) {
  return path.split('.').reduce((o, key) => (o == null ? undefined : o[key]), obj)
}

// Resolve one value: a `$scope.path` string reads from context[scope]; anything else is a literal.
// An unknown scope or missing path resolves to undefined (an action's input validation catches a
// required-but-missing field), never a throw.
export function resolveToken(value, context = {}) {
  if (typeof value !== 'string' || value[0] !== '$') return value
  const dot = value.indexOf('.')
  const scope = dot === -1 ? value.slice(1) : value.slice(1, dot)
  const path = dot === -1 ? '' : value.slice(dot + 1)
  const bucket = context[scope]
  if (bucket === undefined) return undefined
  return path ? readPath(bucket, path) : bucket
}

// Resolve every value of a params object. Non-object params (or none) resolve to an empty object.
export function resolveParams(params, context = {}) {
  if (params == null || typeof params !== 'object') return {}
  const out = {}
  for (const [key, value] of Object.entries(params)) out[key] = resolveToken(value, context)
  return out
}
