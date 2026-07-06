// The pure verdicts: checkSameOrigin (the primary defense) and requireJsonContent (the
// form-POST killer). No config, no settings, no Response; just { ok, reason? }.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkSameOrigin, requireJsonContent } from '../index.js'

const req = (method, headers = {}, url = 'https://app.example.com/api') =>
  new Request(url, { method, headers })

// --- checkSameOrigin: safe methods -----------------------------------------------------

test('GET/HEAD/OPTIONS pass even when blatantly cross-origin', () => {
  for (const method of ['GET', 'HEAD', 'OPTIONS']) {
    assert.equal(checkSameOrigin(req(method, { origin: 'https://evil.example.com' })).ok, true)
  }
})

// --- checkSameOrigin: the Origin header ------------------------------------------------

test('POST with a same-origin Origin passes', () => {
  assert.equal(checkSameOrigin(req('POST', { origin: 'https://app.example.com' })).ok, true)
})

test('POST with a cross-origin Origin fails, with the origin in the reason', () => {
  const verdict = checkSameOrigin(req('POST', { origin: 'https://evil.example.com' }))
  assert.equal(verdict.ok, false)
  assert.match(verdict.reason, /evil\.example\.com/)
})

test('Origin "null" (sandboxed iframe, data: URL) is opaque and fails', () => {
  assert.equal(checkSameOrigin(req('POST', { origin: 'null' })).ok, false)
})

test('an allowlisted Origin passes; entries normalize (trailing slash, casing)', () => {
  const r = req('POST', { origin: 'https://admin.example.com' })
  assert.equal(checkSameOrigin(r).ok, false)
  assert.equal(checkSameOrigin(r, { allowedOrigins: ['https://admin.example.com'] }).ok, true)
  assert.equal(checkSameOrigin(r, { allowedOrigins: ['https://Admin.Example.com/'] }).ok, true)
})

test('a non-URL allowlist entry never widens into a match', () => {
  const r = req('POST', { origin: 'https://evil.example.com' })
  assert.equal(checkSameOrigin(r, { allowedOrigins: ['*', 'example.com'] }).ok, false)
})

test('default ports normalize: Origin without :443 matches an :443 request URL', () => {
  const r = new Request('https://app.example.com:443/api', {
    method: 'POST',
    headers: { origin: 'https://app.example.com' },
  })
  assert.equal(checkSameOrigin(r).ok, true)
})

test('same host on a different port is a different origin and fails', () => {
  assert.equal(checkSameOrigin(req('POST', { origin: 'https://app.example.com:8443' })).ok, false)
})

// --- checkSameOrigin: Sec-Fetch-Site ---------------------------------------------------

test('Sec-Fetch-Site same-origin passes without an Origin header', () => {
  assert.equal(checkSameOrigin(req('POST', { 'sec-fetch-site': 'same-origin' })).ok, true)
})

test('Sec-Fetch-Site none (user-initiated) passes', () => {
  assert.equal(checkSameOrigin(req('POST', { 'sec-fetch-site': 'none' })).ok, true)
})

test('Sec-Fetch-Site cross-site without an Origin header fails: a browser spoke', () => {
  const verdict = checkSameOrigin(req('POST', { 'sec-fetch-site': 'cross-site' }))
  assert.equal(verdict.ok, false)
  assert.match(verdict.reason, /cross-site/)
})

test('Sec-Fetch-Site same-site (sibling subdomain) falls to the Origin check', () => {
  const headers = { 'sec-fetch-site': 'same-site', origin: 'https://other.example.com' }
  assert.equal(checkSameOrigin(req('POST', headers)).ok, false)
  assert.equal(
    checkSameOrigin(req('POST', headers), { allowedOrigins: ['https://other.example.com'] }).ok,
    true,
  )
})

// --- checkSameOrigin: non-browser callers ----------------------------------------------

test('POST with neither header passes: curl / server-to-server, not a CSRF vector', () => {
  assert.equal(checkSameOrigin(req('POST')).ok, true)
  assert.equal(checkSameOrigin(req('DELETE')).ok, true)
})

// --- requireJsonContent ----------------------------------------------------------------

test('safe methods pass without any content-type', () => {
  assert.equal(requireJsonContent(req('GET')).ok, true)
})

test('application/json passes, parameters and casing allowed', () => {
  assert.equal(requireJsonContent(req('POST', { 'content-type': 'application/json' })).ok, true)
  assert.equal(
    requireJsonContent(req('POST', { 'content-type': 'Application/JSON; charset=utf-8' })).ok,
    true,
  )
})

test('application/*+json variants pass', () => {
  assert.equal(
    requireJsonContent(req('POST', { 'content-type': 'application/merge-patch+json' })).ok,
    true,
  )
})

test('the form-POST content types fail', () => {
  for (const ct of ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data']) {
    const verdict = requireJsonContent(req('POST', { 'content-type': ct }))
    assert.equal(verdict.ok, false)
    assert.match(verdict.reason, new RegExp(ct.replace(/[+]/g, '\\+')))
  }
})

test('a body method without a content-type fails', () => {
  const verdict = requireJsonContent(req('POST'))
  assert.equal(verdict.ok, false)
  assert.match(verdict.reason, /none/)
})
