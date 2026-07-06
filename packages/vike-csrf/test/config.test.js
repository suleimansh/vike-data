// The config seam and the DIAMOND: many endpoint extensions extend vike-csrf, so the meta
// declaration must exist exactly once (here), adopters contribute values only, and the
// cumulative csrfExempt contributions must merge to one flat list (settingsFromConfig). Same
// composition proof style as vike-teams' config.test.js; the Vike-level dedupe of a shared
// `extends` target is the mechanism vike-schema's `schemas` already exercises in every app
// that installs auth + admin + queue together.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import csrfConfig from '../+config.js'
import { csrfGuard, csrfSettings, configureCsrf, resetCsrf, settingsFromConfig } from '../index.js'

beforeEach(() => resetCsrf())

// --- the declaration -------------------------------------------------------------------

test('declares both keys once: csrf app-wide, csrfExempt cumulative, both global server-env', () => {
  assert.equal(csrfConfig.name, 'vike-csrf')
  assert.deepEqual(csrfConfig.meta.csrf, { env: { server: true }, global: true })
  assert.deepEqual(csrfConfig.meta.csrfExempt, {
    env: { server: true },
    cumulative: true,
    global: true,
  })
  assert.deepEqual(csrfConfig.csrfExempt, [])
})

test('carries NO hook and NO pointer-import: nothing for a client bundle to resolve (#718)', () => {
  const pointers = JSON.stringify(csrfConfig).match(/import:[^"]+/g) || []
  assert.deepEqual(pointers, [])
  assert.equal(csrfConfig.onCreateGlobalContext, undefined)
})

test('extends nothing: the keystone sits at the bottom of the diamond', () => {
  assert.equal(csrfConfig.extends, undefined)
})

// --- the diamond -----------------------------------------------------------------------

// Three adopters the way #701/#704/#707 will write them: one extends entry, values only.
const adopter = (name, csrfExempt = []) => ({
  name,
  extends: ['import:vike-csrf/config:default'],
  ...(csrfExempt.length ? { csrfExempt } : {}),
})

const stripe = adopter('vike-stripe', ['/webhooks/stripe'])
const push = adopter('vike-push', ['/push/*'])
const actions = adopter('vike-actions')

test('adopters contribute values, never a second meta declaration', () => {
  for (const config of [stripe, push, actions]) {
    assert.equal(config.meta?.csrf, undefined)
    assert.equal(config.meta?.csrfExempt, undefined)
    assert.deepEqual(config.extends, ['import:vike-csrf/config:default'])
  }
})

test('the cumulative contributions merge to one flat exemption list', () => {
  // What Vike hands out for a cumulative config: one entry per contributing source
  // (vike-csrf's default [] included), in install order.
  const csrfExempt = [csrfConfig.csrfExempt, stripe.csrfExempt, push.csrfExempt]
  assert.deepEqual(settingsFromConfig({ csrfExempt }).exempt, ['/webhooks/stripe', '/push/*'])
})

test('a path two extensions both exempt survives once', () => {
  assert.deepEqual(settingsFromConfig({ csrfExempt: [['/hooks'], ['/hooks']] }).exempt, ['/hooks'])
})

// --- the bridge ------------------------------------------------------------------------

test('settingsFromConfig applies the app-wide csrf key alongside the merged exemptions', () => {
  const derived = settingsFromConfig({
    csrf: { allowedOrigins: ['https://admin.example.com'], enforce: true },
    csrfExempt: [['/webhooks/stripe']],
  })
  assert.deepEqual(derived, {
    allowedOrigins: ['https://admin.example.com'],
    enforce: true,
    exempt: ['/webhooks/stripe'],
  })

  // Fed through the holder, the guard honors it end-to-end.
  configureCsrf(derived)
  const cross = (path) =>
    new Request(`https://app.example.com${path}`, {
      method: 'POST',
      headers: { origin: 'https://evil.example.com' },
    })
  assert.equal(csrfGuard(cross('/webhooks/stripe')), null)
  assert.ok(csrfGuard(cross('/api')) instanceof Response)
})

test('no csrf config at all derives the secure default', () => {
  assert.deepEqual(settingsFromConfig({}), { allowedOrigins: [], enforce: true, exempt: [] })
  assert.deepEqual(csrfSettings(), { allowedOrigins: [], enforce: true, exempt: [] })
})

test('outside a Vike app (this test) the guard runs on the holder: secure default', () => {
  // The lazy vike bridge finds no globalContext here, so the holder rules.
  const denied = csrfGuard(
    new Request('https://app.example.com/api', { method: 'POST', headers: { origin: 'https://evil.example.com' } }),
  )
  assert.ok(denied instanceof Response)
})
