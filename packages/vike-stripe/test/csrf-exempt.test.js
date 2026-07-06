// CSRF exemption (#707): the webhooks are signature-verified and not cookie-authenticated,
// so both billing models self-declare on vike-csrf's cumulative csrfExempt seam. First real
// consumer of the seam: these tests prove the contribution composes through bootstrap into
// a guard that lets Stripe through while everything else stays protected.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { csrfGuard, configureCsrf, resetCsrf, settingsFromConfig } from 'vike-csrf'
import purchaseConfig from '../purchase/+config.js'
import subscriptionConfig from '../subscription/+config.js'
import { PURCHASE_WEBHOOK_PATH } from '../purchase/middleware.js'
import { SUBSCRIPTION_WEBHOOK_PATH } from '../subscription/middleware.js'

beforeEach(() => resetCsrf())

test('both models contribute their webhook path, matching the middleware constant', () => {
  assert.deepEqual(purchaseConfig.csrfExempt, [PURCHASE_WEBHOOK_PATH])
  assert.deepEqual(subscriptionConfig.csrfExempt, [SUBSCRIPTION_WEBHOOK_PATH])
})

test('both models self-install vike-csrf; values only, no meta re-declaration', () => {
  for (const config of [purchaseConfig, subscriptionConfig]) {
    assert.ok(config.extends.includes('import:vike-csrf/config:default'))
    assert.equal(config.meta.csrf, undefined)
    assert.equal(config.meta.csrfExempt, undefined)
  }
})

test('the seam end-to-end: Stripe reaches the webhook, a forged POST elsewhere still 403s', () => {
  // What Vike resolves when both models are installed: one cumulative entry per source.
  configureCsrf(
    settingsFromConfig({ csrfExempt: [purchaseConfig.csrfExempt, subscriptionConfig.csrfExempt] }),
  )

  // Stripe's delivery is server-to-server (no Origin header), but even a browser-shaped
  // cross-origin POST passes on the exempted path: signature verification is the defense here.
  const webhook = new Request(`https://app.example.com${PURCHASE_WEBHOOK_PATH}`, {
    method: 'POST',
    headers: { origin: 'https://evil.example.com' },
  })
  assert.equal(csrfGuard(webhook), null)

  const elsewhere = new Request('https://app.example.com/uploads', {
    method: 'POST',
    headers: { origin: 'https://evil.example.com' },
  })
  assert.ok(csrfGuard(elsewhere) instanceof Response)
})
