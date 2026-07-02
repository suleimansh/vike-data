// Validating an action's input. `input` is optional; when set it's either:
//   - a FUNCTION `(raw) => value` that coerces/validates and throws on bad input (compose
//     vike-schema or any validator here), or
//   - a SHAPE object `{ field: 'string' | 'number' | 'boolean' | 'any' }` — a tiny built-in check
//     for the common case (every field required, typeof match), returning the picked subset.
// A ValidationError carries `status: 400` so the endpoint answers a bad body with 400, not 500.

export class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
    this.status = 400
  }
}

const typeOk = (kind, value) => {
  if (kind === 'any') return value !== undefined
  if (kind === 'number') return typeof value === 'number' && !Number.isNaN(value)
  return typeof value === kind // 'string' | 'boolean'
}

// Check `raw` against a shape; return only the declared fields. Throws ValidationError on a missing
// or wrong-typed field, listing the offender.
export function validateShape(shape, raw) {
  const input = raw ?? {}
  const out = {}
  for (const [field, kind] of Object.entries(shape)) {
    if (!typeOk(kind, input[field])) {
      throw new ValidationError(`field "${field}" must be a ${kind}`)
    }
    out[field] = input[field]
  }
  return out
}

// Run whichever form of `input` an action declared. No `input` -> pass the raw body through.
export async function validateInput(input, raw) {
  if (input == null) return raw ?? {}
  if (typeof input === 'function') return await input(raw ?? {})
  return validateShape(input, raw)
}
