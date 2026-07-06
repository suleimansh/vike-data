// The config seam and the DIAMOND: many endpoint extensions extend vike-csrf, so the meta
// declaration must exist exactly once (here), adopters contribute values only, and the
// cumulative csrfExempt contributions must merge to one flat list through bootstrap. Same
// composition proof style as vike-teams' config.test.js; the Vike-level dedupe of a shared
// `extends` target is the mechanism vike-schema's `schemas` already exercises in every app
// that installs auth + admin + queue together.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import csrfConfig from '../+config.js'
import bootstrapCsrf from '../bootstrap.js'
import { csrfGuard, csrfSettings, resetCsrf } from '../index.js'

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

test('wires the config -> runtime bridge as a pointer-import hook', () => {
  assert.equal(csrfConfig.onCreateGlobalContext, 'import:vike-csrf/bootstrap:default')
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
  // What Vike hands the hook for a cumulative config: one entry per contributing source
  // (vike-csrf's default [] included), in install order.
  const csrfExempt = [csrfConfig.csrfExempt, stripe.csrfExempt, push.csrfExempt]
  bootstrapCsrf({ isClientSide: false, config: { csrfExempt } })
  assert.deepEqual(csrfSettings().exempt, ['/webhooks/stripe', '/push/*'])
})

test('a path two extensions both exempt survives once', () => {
  bootstrapCsrf({ isClientSide: false, config: { csrfExempt: [['/hooks'], ['/hooks']] } })
  assert.deepEqual(csrfSettings().exempt, ['/hooks'])
})

// --- the bridge ------------------------------------------------------------------------

test('bootstrap applies the app-wide csrf key alongside the merged exemptions', () => {
  bootstrapCsrf({
    isClientSide: false,
    config: {
      csrf: { allowedOrigins: ['https://admin.example.com'], enforce: true },
      csrfExempt: [['/webhooks/stripe']],
    },
  })
  assert.deepEqual(csrfSettings(), {
    allowedOrigins: ['https://admin.example.com'],
    enforce: true,
    exempt: ['/webhooks/stripe'],
  })

  const cross = (path) =>
    new Request(`https://app.example.com${path}`, {
      method: 'POST',
      headers: { origin: 'https://evil.example.com' },
    })
  assert.equal(csrfGuard(cross('/webhooks/stripe')), null)
  assert.ok(csrfGuard(cross('/api')) instanceof Response)
})

test('no csrf config at all leaves the secure default in place', () => {
  bootstrapCsrf({ isClientSide: false, config: {} })
  assert.deepEqual(csrfSettings(), { allowedOrigins: [], enforce: true, exempt: [] })
})

test('the hook is a server hook: on the client it must not touch the settings', () => {
  bootstrapCsrf({ isClientSide: true, config: { csrf: { enforce: false } } })
  assert.deepEqual(csrfSettings(), { allowedOrigins: [], enforce: true, exempt: [] })
})
