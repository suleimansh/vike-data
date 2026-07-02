// The invocation endpoint: ONE @universal-middleware that owns `POST /_actions/<name>`, resolves the
// signed-in user, and runs the named action. It never touches the DB itself — it calls the pure
// runAction (run.js) and shapes its envelope into a JSON Response. Same shape as vike-admin's
// api.js: a universal middleware (not a Vike page, which can only emit text/html) that returns a
// Response only for its own path and falls through otherwise.
//
// The default export is wired for the common case (user via vike-auth). `createActionsHandler` lets
// an app swap the user resolver or inject a per-request context (most importantly a `db`, so an
// action's run reads `{ input, user, db }` instead of importing its own repo).
import { enhance, MiddlewareOrder } from '@universal-middleware/core'
import { runAction } from './run.js'
import { getAction } from './registry.js'

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } })

// The default user resolver — vike-auth's session-cookie tier, imported LAZILY so importing this
// module (or unit-testing the handler with an injected resolver) doesn't pull vike-auth's runtime.
async function defaultResolveUser(request) {
  const { resolveSessionUser } = await import('vike-auth/server')
  return resolveSessionUser(request)
}

// Build the handler. `resolveUser(request) -> user|null` and `buildContext({ request, user }) ->
// extra` (merged into the action context, e.g. `{ db }`) are both injectable.
export function createActionsHandler({ resolveUser = defaultResolveUser, buildContext } = {}) {
  // A request is handled at most once: a universal middleware can be collected more than once, and a
  // Response only short-circuits route handlers, not other middlewares — without this a second run
  // would re-read the body and run the action twice. Mirrors vike-admin's api.js.
  const handled = new WeakSet()

  return async function actionsApi(request) {
    const url = new URL(request.url)
    const match = url.pathname.match(/^\/_actions\/([^/]+)$/)
    if (!match) return // not our path -> fall through to Vike

    if (request.method !== 'POST') return json(405, { error: `Method ${request.method} not allowed` })
    if (handled.has(request)) return
    handled.add(request)

    const name = decodeURIComponent(match[1])
    if (!getAction(name)) return json(404, { error: `Unknown action "${name}"` })

    let input = {}
    try {
      const raw = await request.text()
      input = raw ? JSON.parse(raw) : {}
    } catch {
      return json(400, { error: 'Request body must be valid JSON' })
    }
    if (input === null || typeof input !== 'object' || Array.isArray(input)) {
      return json(400, { error: 'Request body must be a JSON object' })
    }

    let out
    try {
      const user = await resolveUser(request)
      const extra = buildContext ? await buildContext({ request, user }) : {}
      out = await runAction({ name, input, user, ...extra })
    } catch {
      return json(500, { error: 'Internal error' })
    }

    return out.ok
      ? json(out.status, { ok: true, result: out.result, onSuccess: out.onSuccess })
      : json(out.status, { ok: false, error: out.error })
  }
}

// order = AUTHENTICATION marks this as a middleware (runs on every request, returns a Response only
// for /_actions/*); no `path` so it sees every request, like vike-auth's and vike-admin's.
export default enhance(createActionsHandler(), { name: 'vike-actions', order: MiddlewareOrder.AUTHENTICATION })
