import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineAction, runAction, clearActions } from '../index.js'

beforeEach(() => clearActions())

test('unknown action -> 404 envelope', async () => {
  assert.deepEqual(await runAction({ name: 'nope' }), { ok: false, status: 404, error: 'Unknown action "nope"' })
})

test('happy path: runs, passes { input, user, ...ctx }, echoes onSuccess', async () => {
  let seen
  defineAction('publish', {
    onSuccess: 'reload',
    run: async (ctx) => {
      seen = ctx
      return { published: ctx.input.id }
    },
  })
  const db = { marker: true }
  const out = await runAction({ name: 'publish', input: { id: 7 }, user: { id: 'u1' }, db })
  assert.deepEqual(out, { ok: true, status: 200, result: { published: 7 }, onSuccess: 'reload' })
  assert.deepEqual(seen.input, { id: 7 })
  assert.deepEqual(seen.user, { id: 'u1' })
  assert.equal(seen.db, db) // endpoint-injected context reaches run
})

test('shape input validates + narrows to declared fields; bad type -> 400', async () => {
  defineAction('mk', { input: { id: 'string' }, run: async ({ input }) => input })
  const ok = await runAction({ name: 'mk', input: { id: 'a', extra: 'dropped' } })
  assert.deepEqual(ok.result, { id: 'a' })
  const bad = await runAction({ name: 'mk', input: { id: 5 } })
  assert.equal(bad.ok, false)
  assert.equal(bad.status, 400)
})

test('function input can coerce/validate and its throw becomes 400', async () => {
  defineAction('mk', {
    input: (raw) => {
      if (!raw.name) throw new Error('name required')
      return { name: String(raw.name).trim() }
    },
    run: async ({ input }) => input,
  })
  assert.deepEqual((await runAction({ name: 'mk', input: { name: ' Ada ' } })).result, { name: 'Ada' })
  assert.equal((await runAction({ name: 'mk', input: {} })).status, 400)
})

test('guard denies -> 403, allows -> runs; a throwing guard is a deny (403), not 500', async () => {
  defineAction('editor', { guard: (ctx) => ctx.user?.role === 'editor', run: async () => 'done' })
  assert.equal((await runAction({ name: 'editor', user: { role: 'viewer' } })).status, 403)
  assert.equal((await runAction({ name: 'editor', user: { role: 'editor' } })).result, 'done')

  defineAction('boom', { guard: () => { throw new Error('nope') }, run: async () => 'x' })
  assert.equal((await runAction({ name: 'boom' })).status, 403)
})

test("the 'authed' named guard requires a user", async () => {
  defineAction('a', { guard: 'authed', run: async () => 'ok' })
  assert.equal((await runAction({ name: 'a', user: null })).status, 403)
  assert.equal((await runAction({ name: 'a', user: { id: 1 } })).result, 'ok')
})

test('an array guard is AND-merged', async () => {
  defineAction('a', { guard: ['authed', (ctx) => ctx.user.role === 'admin'], run: async () => 'ok' })
  assert.equal((await runAction({ name: 'a', user: { role: 'member' } })).status, 403)
  assert.equal((await runAction({ name: 'a', user: { role: 'admin' } })).result, 'ok')
})

test('a throwing run -> 500 by default, or the error\'s own status', async () => {
  defineAction('boom', { run: async () => { throw new Error('kaboom') } })
  assert.equal((await runAction({ name: 'boom' })).status, 500)

  defineAction('missing', { run: async () => { const e = new Error('gone'); e.status = 404; throw e } })
  const out = await runAction({ name: 'missing' })
  assert.equal(out.status, 404)
  assert.equal(out.error, 'gone')
})
