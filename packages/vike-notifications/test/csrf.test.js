// CSRF adoption (#706): the mark-read POST verifies the caller (vike-csrf) before resolving
// the user and demands a JSON body, so a cross-site page cannot mark a victim's feed read.
// The GET feed reads are safe methods and untouched.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { resetCsrf } from 'vike-csrf'
import { createNotificationsMiddleware } from '../middleware.js'
import notificationsConfig from '../+config.js'

const mw = createNotificationsMiddleware()

beforeEach(() => resetCsrf())

test('a cross-origin mark-read POST -> 403, before the session is read', async () => {
  const res = await mw(
    new Request('http://localhost/notifications/read', {
      method: 'POST',
      headers: { origin: 'https://evil.example.com', 'content-type': 'application/json' },
      body: '{}',
    }),
  )
  assert.equal(res.status, 403)
  assert.deepEqual(await res.json(), { error: 'Cross-origin request rejected' })
})

test('the text/plain form-POST trick -> 415', async () => {
  const res = await mw(new Request('http://localhost/notifications/read', { method: 'POST', body: '{}' }))
  assert.equal(res.status, 415)
  assert.match((await res.json()).error, /application\/json/)
})

test('a same-origin JSON POST passes both checks and hits the auth check (401 without a session)', async () => {
  const res = await mw(
    new Request('http://localhost/notifications/read', {
      method: 'POST',
      headers: { origin: 'http://localhost', 'content-type': 'application/json' },
      body: '{}',
    }),
  )
  assert.equal(res.status, 401)
})

test('the GET feed is a safe method: never blocked, even flagged cross-site', async () => {
  const res = await mw(
    new Request('http://localhost/notifications', { headers: { 'sec-fetch-site': 'cross-site' } }),
  )
  assert.notEqual(res?.status, 403)
})

test('self-installs vike-csrf next to schema + auth; values only, no meta re-declaration', () => {
  assert.deepEqual(notificationsConfig.extends, [
    'import:@vike-data/vike-schema/config:default',
    'import:vike-auth/config:default',
    'import:vike-csrf/config:default',
  ])
  assert.equal(notificationsConfig.meta?.csrf, undefined)
  assert.equal(notificationsConfig.meta?.csrfExempt, undefined)
})
