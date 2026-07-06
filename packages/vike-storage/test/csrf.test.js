// CSRF adoption (#704): the storage middleware verifies the caller (vike-csrf) before
// resolving the user, so a cross-origin browser can neither upload under the victim's
// session nor delete their uploads. Non-browser callers and the GET reads are untouched.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { resetCsrf, configureCsrf } from 'vike-csrf'
import { createStorageMiddleware } from '../middleware.js'
import storageConfig from '../+config.js'

const mw = createStorageMiddleware()
const evil = { origin: 'https://evil.example.com' }

beforeEach(() => resetCsrf())

test('a cross-origin upload POST -> 403, before the session is even read', async () => {
  const res = await mw(new Request('http://localhost/uploads', { method: 'POST', headers: evil }))
  assert.equal(res.status, 403)
  assert.deepEqual(await res.json(), { error: 'Cross-origin request rejected' })
})

test('a cross-origin DELETE -> 403 too', async () => {
  const res = await mw(new Request('http://localhost/uploads/some-id', { method: 'DELETE', headers: evil }))
  assert.equal(res.status, 403)
})

test('a same-origin POST passes the guard and hits the auth check (401 without a session)', async () => {
  const res = await mw(new Request('http://localhost/uploads', { method: 'POST', headers: { origin: 'http://localhost' } }))
  assert.equal(res.status, 401)
})

test('an allowlisted origin (the shared csrf config key) passes the guard', async () => {
  configureCsrf({ allowedOrigins: ['https://trusted.example.com'] })
  const res = await mw(new Request('http://localhost/uploads', { method: 'POST', headers: { origin: 'https://trusted.example.com' } }))
  assert.equal(res.status, 401) // past the guard, into auth
})

test('the GET read is a safe method: never blocked, even flagged cross-site', async () => {
  const res = await mw(new Request('http://localhost/uploads/nope', { headers: { 'sec-fetch-site': 'cross-site' } }))
  assert.notEqual(res?.status, 403)
})

test('self-installs vike-csrf next to schema + auth; values only, no meta re-declaration', () => {
  assert.deepEqual(storageConfig.extends, [
    'import:@vike-data/vike-schema/config:default',
    'import:vike-auth/config:default',
    'import:vike-csrf/config:default',
  ])
  assert.equal(storageConfig.meta?.csrf, undefined)
  assert.equal(storageConfig.meta?.csrfExempt, undefined)
})
