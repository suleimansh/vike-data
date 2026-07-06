// CSRF adoption (#705): the push middleware verifies the caller (vike-csrf) before resolving
// the user, and demands a JSON body on its two owned POSTs, so a cross-site page can neither
// subscribe a victim to attacker pushes nor silently unsubscribe them.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { resetCsrf } from 'vike-csrf'
import { createPushMiddleware } from '../middleware.js'
import pushConfig from '../+config.js'

const mw = createPushMiddleware()

beforeEach(() => resetCsrf())

test('a cross-origin subscribe POST -> 403, before the session is read', async () => {
  const res = await mw(
    new Request('http://localhost/push/subscribe', {
      method: 'POST',
      headers: { origin: 'https://evil.example.com', 'content-type': 'application/json' },
      body: '{}',
    }),
  )
  assert.equal(res.status, 403)
  assert.deepEqual(await res.json(), { error: 'Cross-origin request rejected' })
})

test('a cross-origin unsubscribe POST -> 403 too', async () => {
  const res = await mw(
    new Request('http://localhost/push/unsubscribe', {
      method: 'POST',
      headers: { origin: 'https://evil.example.com', 'content-type': 'application/json' },
      body: '{}',
    }),
  )
  assert.equal(res.status, 403)
})

test('the text/plain form-POST trick -> 415 on the owned endpoints', async () => {
  const res = await mw(new Request('http://localhost/push/subscribe', { method: 'POST', body: '{}' })) // text/plain
  assert.equal(res.status, 415)
  assert.match((await res.json()).error, /application\/json/)
})

test('a same-origin JSON POST passes both checks and hits the auth check (401 without a session)', async () => {
  const res = await mw(
    new Request('http://localhost/push/subscribe', {
      method: 'POST',
      headers: { origin: 'http://localhost', 'content-type': 'application/json' },
      body: '{}',
    }),
  )
  assert.equal(res.status, 401)
})

test('an unknown /push/ path stays a 404, not a 415', async () => {
  const res = await mw(new Request('http://localhost/push/nope', { method: 'POST' }))
  assert.equal(res.status, 404)
})

test('self-installs vike-csrf next to schema + auth; values only, no meta re-declaration', () => {
  assert.deepEqual(pushConfig.extends, [
    'import:@vike-data/vike-schema/config:default',
    'import:vike-auth/config:default',
    'import:vike-csrf/config:default',
  ])
  assert.equal(pushConfig.meta?.csrf, undefined)
  assert.equal(pushConfig.meta?.csrfExempt, undefined)
})
