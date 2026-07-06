// The endpoint handler is a plain (request) -> Response, so it tests with a fabricated Request and an
// injected user resolver (no vike-auth, no Vike). Covers path matching, method/verb, body parsing,
// user + db injection, and the JSON envelope for each runAction outcome.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineAction, clearActions, createActionsHandler } from '../index.js'

const post = (name, body) =>
  new Request(`http://x/_actions/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

beforeEach(() => clearActions())

test('non-matching path falls through (returns undefined)', async () => {
  const handle = createActionsHandler({ resolveUser: async () => null })
  assert.equal(await handle(new Request('http://x/posts')), undefined)
})

test('our path with the wrong verb -> 405', async () => {
  const handle = createActionsHandler({ resolveUser: async () => null })
  const res = await handle(new Request('http://x/_actions/publish', { method: 'GET' }))
  assert.equal(res.status, 405)
})

test('unknown action -> 404', async () => {
  const handle = createActionsHandler({ resolveUser: async () => null })
  const res = await handle(post('nope', {}))
  assert.equal(res.status, 404)
})

test('happy path: injects user + db, returns 200 with result + onSuccess', async () => {
  let seen
  defineAction('publish', { onSuccess: 'reload', run: async (ctx) => { seen = ctx; return { id: ctx.input.id } } })
  const db = { tag: 'db' }
  const handle = createActionsHandler({
    resolveUser: async () => ({ id: 'u1' }),
    buildContext: async ({ user }) => ({ db, who: user.id }),
  })
  const res = await handle(post('publish', { id: 7 }))
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { ok: true, result: { id: 7 }, onSuccess: 'reload' })
  assert.equal(seen.user.id, 'u1')
  assert.equal(seen.db, db)
  assert.equal(seen.who, 'u1') // arbitrary buildContext extras reach the action
})

test('a guard denial surfaces as 403 { ok:false }', async () => {
  defineAction('editorOnly', { guard: (ctx) => ctx.user?.role === 'editor', run: async () => 'x' })
  const handle = createActionsHandler({ resolveUser: async () => ({ role: 'viewer' }) })
  const res = await handle(post('editorOnly', {}))
  assert.equal(res.status, 403)
  assert.deepEqual(await res.json(), { ok: false, error: 'Forbidden' })
})

test('a non-JSON body -> 400; a JSON array body -> 400', async () => {
  defineAction('a', { run: async () => 'ok' })
  const handle = createActionsHandler({ resolveUser: async () => null })
  const headers = { 'Content-Type': 'application/json' }
  const bad = await handle(new Request('http://x/_actions/a', { method: 'POST', headers, body: 'not json{' }))
  assert.equal(bad.status, 400)
  const arr = await handle(new Request('http://x/_actions/a', { method: 'POST', headers, body: '[1,2]' }))
  assert.equal(arr.status, 400)
})

test('an empty body is treated as {}', async () => {
  defineAction('ping', { run: async ({ input }) => ({ got: input }) })
  const handle = createActionsHandler({ resolveUser: async () => null })
  const res = await handle(
    new Request('http://x/_actions/ping', { method: 'POST', headers: { 'Content-Type': 'application/json' } }),
  )
  assert.equal(res.status, 200)
  assert.deepEqual(await res.json(), { ok: true, result: { got: {} }, onSuccess: null })
})

test('the same request is handled at most once (no double-run)', async () => {
  let runs = 0
  defineAction('inc', { run: async () => { runs++; return runs } })
  const handle = createActionsHandler({ resolveUser: async () => null })
  const req = post('inc', {})
  await handle(req)
  const second = await handle(req)
  assert.equal(second, undefined) // second pass short-circuits
  assert.equal(runs, 1)
})

// --- CSRF defense-in-depth (#677, via vike-csrf) -----------------------------------------

test('a cross-origin POST -> 403 before the registry or body is touched', async () => {
  let ran = false
  defineAction('protected', { run: async () => { ran = true } })
  const handle = createActionsHandler({ resolveUser: async () => null })
  const res = await handle(
    new Request('http://x/_actions/protected', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', origin: 'https://evil.example.com' },
      body: '{}',
    }),
  )
  assert.equal(res.status, 403)
  assert.deepEqual(await res.json(), { error: 'Cross-origin request rejected' })
  assert.equal(ran, false)
})

test('a same-origin POST passes the guard', async () => {
  defineAction('protected', { run: async () => 'ok' })
  const handle = createActionsHandler({ resolveUser: async () => null })
  const res = await handle(
    new Request('http://x/_actions/protected', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', origin: 'http://x' },
      body: '{}',
    }),
  )
  assert.equal(res.status, 200)
})

test('the text/plain form-POST trick -> 415, even with a valid JSON payload', async () => {
  defineAction('protected', { run: async () => 'ok' })
  const handle = createActionsHandler({ resolveUser: async () => null })
  const res = await handle(
    new Request('http://x/_actions/protected', { method: 'POST', body: '{"a":1}' }), // text/plain
  )
  assert.equal(res.status, 415)
  assert.match((await res.json()).error, /application\/json/)
})

test('self-installs vike-csrf: one extends entry, values only', async () => {
  const { default: config } = await import('../+config.js')
  assert.deepEqual(config.extends, ['import:vike-csrf/config:default'])
  assert.equal(config.meta?.csrf, undefined) // never re-declare the meta
})
