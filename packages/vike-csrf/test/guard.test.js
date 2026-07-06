// csrfGuard: the composite adopters call first thing in their endpoint middleware. These
// tests pin the null | 403-Response contract, the exemption matching, the enforce knob, and
// the secure unconfigured default.
import { test, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { csrfGuard, configureCsrf, csrfSettings, resetCsrf, isExempt } from '../index.js'

const post = (headers = {}, path = '/api') =>
  new Request(`https://app.example.com${path}`, { method: 'POST', headers })

beforeEach(() => resetCsrf())

test('unconfigured means the secure default: enforce on, nothing allowed, nothing exempt', () => {
  assert.deepEqual(csrfSettings(), { allowedOrigins: [], enforce: true, exempt: [] })
})

test('a cross-origin POST gets a 403 JSON Response; a same-origin one gets null', async () => {
  const denied = csrfGuard(post({ origin: 'https://evil.example.com' }))
  assert.ok(denied instanceof Response)
  assert.equal(denied.status, 403)
  assert.equal(denied.headers.get('content-type'), 'application/json')
  assert.deepEqual(await denied.json(), { error: 'Cross-origin request rejected' })

  assert.equal(csrfGuard(post({ origin: 'https://app.example.com' })), null)
})

test('a non-browser POST (no headers) passes', () => {
  assert.equal(csrfGuard(post()), null)
})

test('configureCsrf feeds the guard: allowlisted origins pass', () => {
  const r = () => post({ origin: 'https://admin.example.com' })
  assert.ok(csrfGuard(r()) instanceof Response)
  configureCsrf({ allowedOrigins: ['https://admin.example.com'] })
  assert.equal(csrfGuard(r()), null)
})

test('enforce: false logs the would-be rejection and lets the request through', () => {
  configureCsrf({ enforce: false })
  const warn = mock.method(console, 'warn', () => {})
  try {
    assert.equal(csrfGuard(post({ origin: 'https://evil.example.com' })), null)
    assert.equal(warn.mock.callCount(), 1)
    assert.match(warn.mock.calls[0].arguments[0], /\[vike-csrf\] would reject POST \/api/)
  } finally {
    warn.mock.restore()
  }
})

test('exempt paths pass whatever the headers say', () => {
  configureCsrf({ exempt: ['/webhooks/stripe'] })
  const evil = { origin: 'https://evil.example.com' }
  assert.equal(csrfGuard(post(evil, '/webhooks/stripe')), null)
  assert.ok(csrfGuard(post(evil, '/api')) instanceof Response)
})

test('exemption matching: exact, or a trailing /* wildcard; never a plain prefix', () => {
  assert.equal(isExempt('/webhooks/stripe', ['/webhooks/stripe']), true)
  assert.equal(isExempt('/webhooks/stripe-evil', ['/webhooks/stripe']), false)
  assert.equal(isExempt('/webhooks/stripe/extra', ['/webhooks/stripe']), false)

  assert.equal(isExempt('/webhooks', ['/webhooks/*']), true)
  assert.equal(isExempt('/webhooks/stripe', ['/webhooks/*']), true)
  assert.equal(isExempt('/webhooks/a/b', ['/webhooks/*']), true)
  assert.equal(isExempt('/webhooks-evil', ['/webhooks/*']), false)
})

test('overrides win over the configured settings, for direct callers and tests', () => {
  configureCsrf({ allowedOrigins: ['https://admin.example.com'] })
  const r = post({ origin: 'https://admin.example.com' })
  assert.ok(csrfGuard(r, { allowedOrigins: [] }) instanceof Response)
})

test('csrfSettings returns copies: mutating the snapshot cannot poke the live settings', () => {
  csrfSettings().exempt.push('/oops')
  csrfSettings().allowedOrigins.push('https://evil.example.com')
  assert.deepEqual(csrfSettings(), { allowedOrigins: [], enforce: true, exempt: [] })
})

test('resetCsrf restores the secure default', () => {
  configureCsrf({ enforce: false, exempt: ['/x'], allowedOrigins: ['https://a.example.com'] })
  resetCsrf()
  assert.deepEqual(csrfSettings(), { allowedOrigins: [], enforce: true, exempt: [] })
})
