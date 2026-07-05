// The pure executor: name + input + context -> a plain result envelope. This is the framework- and
// transport-agnostic heart of vike-actions — no HTTP, no Vike, no session parsing — so it unit-tests
// directly with a fake user/db. The endpoint (endpoint.js) is a thin adapter that resolves the user,
// parses the body, calls this, and shapes the Response.
//
// The envelope is always `{ ok, status, ... }`:
//   ok: true  -> { ok: true, status: 200, result, onSuccess }
//   ok: false -> { ok: false, status, error }   (404 unknown, 400 bad input, 403 denied, 500 threw)
import { getAction } from './registry.js'
import { runGuard } from './guard.js'
import { validateInput } from './validate.js'

// A thrown error's message reaches the client ONLY when the error opts in with an explicit integer
// `status` (the documented `throw Object.assign(new Error('gone'), { status: 404 })` path). An
// unexpected throw — a TypeError, a DB driver error whose message carries schema detail — has no
// status, so it stays a generic fallback and never leaks internal detail. Mirrors how the endpoint's
// outer catch already sanitizes resolveUser/buildContext failures to 'Internal error'.
const clientError = (e, fallback) => (Number.isInteger(e?.status) && e?.message ? e.message : fallback)

// `onSuccess` is a client-effect HINT the binding runs after a 200 (reload / redirect / toast). It's
// usually a static string/object, but can be a `(result, ctx) => hint` FUNCTION so the effect can use
// the write result (e.g. toast the created row's name). A function is evaluated HERE, server-side, so
// only its plain, serializable result crosses to the client — never the closure. A throwing hint is
// a no-op (the write already succeeded; a bad UX hint must not fail the action).
async function resolveOnSuccess(onSuccess, result, ctx) {
  if (typeof onSuccess !== 'function') return onSuccess ?? null
  try {
    return (await onSuccess(result, ctx)) ?? null
  } catch {
    return null
  }
}

export async function runAction({ name, input = {}, user = null, ...rest } = {}) {
  const action = getAction(name)
  if (!action) return { ok: false, status: 404, error: `Unknown action "${name}"` }

  let value
  try {
    value = await validateInput(action.input, input)
  } catch (e) {
    return { ok: false, status: e.status ?? 400, error: e.message ?? 'Invalid input' }
  }

  // `rest` carries whatever the endpoint injected (most importantly `db`), so an action's run reads
  // `{ input, user, db, ... }`.
  const ctx = { input: value, user, ...rest }

  let allowed
  try {
    allowed = await runGuard(action.guard, ctx)
  } catch (e) {
    // A guard that throws is a deny, not a 500 — treat a broken predicate as "not allowed". A broken
    // predicate's message never leaks (only an error opting into a status is surfaced).
    return { ok: false, status: Number.isInteger(e?.status) ? e.status : 403, error: clientError(e, 'Forbidden') }
  }
  if (!allowed) return { ok: false, status: 403, error: 'Forbidden' }

  try {
    const result = await action.run(ctx)
    return { ok: true, status: 200, result: result ?? null, onSuccess: await resolveOnSuccess(action.onSuccess, result, ctx) }
  } catch (e) {
    // An action can opt into a specific status (e.g. throw an error with `.status = 404`) and its
    // message is surfaced; an unexpected throw is a 500 with a generic message so a driver/internal
    // error's detail never leaks to the client.
    return { ok: false, status: Number.isInteger(e?.status) ? e.status : 500, error: clientError(e, 'Action failed') }
  }
}
