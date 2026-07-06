// CSRF adoption (#701): the shared handler calls vike-csrf's guard before any write path,
// so the login/logout POSTs (the classic CSRF targets) reject cross-origin browsers on
// every guard, default and named alike. Non-browser callers (no Origin / Sec-Fetch-Site)
// pass, which is what every other test file in this package sends.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { configureCsrf, resetCsrf } from 'vike-csrf'
import { handleAuthRequest } from '../middleware.js'
import { defineGuard } from '../guards.js'
import authConfig from '../+config.js'

const guard = defineGuard('csrf', { table: 'csrf_users', sessionTable: 'csrf_sessions', loginTokenTable: 'csrf_login_tokens' })
const opts = { auth: guard.instance, cookieName: guard.cookieName, basePath: guard.basePath, dev: true, secure: false }

const post = (path, headers = {}) =>
  new Request(`http://localhost${path}`, { method: 'POST', headers })

beforeEach(() => resetCsrf())

test('a cross-origin login POST -> 403 HTML, before the auth instance is touched', async () => {
  const res = await handleAuthRequest(post('/csrf-auth/request', { origin: 'https://evil.example.com' }), opts)
  assert.equal(res.status, 403)
  assert.match(res.headers.get('content-type'), /text\/html/)
  assert.match(await res.text(), /Cross-origin request rejected/)
})

test('a cross-origin logout POST -> 403 too', async () => {
  const res = await handleAuthRequest(post('/csrf-auth/logout', { origin: 'https://evil.example.com' }), opts)
  assert.equal(res.status, 403)
})

test('a same-origin POST passes the guard and reaches the handler', async () => {
  const form = new FormData()
  form.set('email', 'someone@example.com')
  const res = await handleAuthRequest(
    new Request('http://localhost/csrf-auth/request', { method: 'POST', headers: { origin: 'http://localhost' }, body: form }),
    opts,
  )
  assert.notEqual(res.status, 403)
})

test('the GET callback is a safe method: never blocked, even flagged cross-site', async () => {
  const res = await handleAuthRequest(
    new Request('http://localhost/csrf-auth/callback?token=nope', { headers: { 'sec-fetch-site': 'cross-site' } }),
    opts,
  )
  assert.notEqual(res.status, 403)
})

test('an allowlisted origin (the shared csrf config key) passes', async () => {
  configureCsrf({ allowedOrigins: ['https://trusted.example.com'] })
  const res = await handleAuthRequest(post('/csrf-auth/logout', { origin: 'https://trusted.example.com' }), opts)
  assert.notEqual(res.status, 403)
})

test('self-installs vike-csrf next to vike-schema; values only, no meta re-declaration', () => {
  assert.deepEqual(authConfig.extends, [
    'import:@vike-data/vike-schema/config:default',
    'import:vike-csrf/config:default',
  ])
  assert.equal(authConfig.meta?.csrf, undefined)
  assert.equal(authConfig.meta?.csrfExempt, undefined)
})
