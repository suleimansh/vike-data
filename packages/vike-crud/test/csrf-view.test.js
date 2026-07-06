// CSRF adoption (#703): the generic data hook verifies the caller (vike-csrf) before reading a
// POST body, and csrfRequestOf normalizes the two request surfaces for the check. A cross-site
// page can forge exactly this plain SSR form post, so a cross-origin browser POST must never
// reach the write path.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { setAdapter, clearAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'
import { resetCsrf, configureCsrf } from 'vike-csrf'
import { defineResource, resourcePages, resolveViewTables, buildDb } from '../index.js'
import { viewData } from '../react/viewData.js'
import { csrfRequestOf } from '../request.js'

const posts = defineSchema('posts', (t) => {
  t.uuid('id').primary()
  t.string('title')
  t.timestamps()
})
const config = (resources) => ({ schemas: [posts], resources })
const resources = resourcePages(defineResource({ table: 'posts', mode: 'route' }))

// The authorization.test.js pageContext, plus request headers (the CSRF signal).
function pc({ pathname, method = 'GET', body, headers = {} }) {
  const context = { config: config(resources), urlPathname: pathname, urlParsed: { search: {} }, user: { id: 'u1' } }
  if (method === 'POST') {
    context._reqWeb = new Request('http://x' + pathname, { method: 'POST', headers, body: new URLSearchParams(body) })
  }
  return context
}

let db
beforeEach(async () => {
  resetCsrf()
  clearAdapter()
  setAdapter(createMemoryAdapter())
  db = buildDb(resolveViewTables({ schemas: [posts] }))
})

test('a cross-origin form POST is rejected before the write; the row never lands', async () => {
  await assert.rejects(
    viewData(pc({ pathname: '/posts/new', method: 'POST', body: { title: 'Forged', _table: 'posts' }, headers: { origin: 'https://evil.example.com' } })),
    (err) => err._pageContextAbort?.abortStatusCode === 403, // Vike's render(403) abort
  )
  assert.equal(await db.posts.count(), 0)
})

test('a same-origin form POST passes the guard and writes (then redirects)', async () => {
  await assert.rejects(
    viewData(pc({ pathname: '/posts/new', method: 'POST', body: { title: 'Mine', _table: 'posts' }, headers: { origin: 'http://x' } })),
    (err) => err._pageContextAbort?._urlRedirect?.url === '/posts', // the post-write redirect abort
  )
  assert.equal(await db.posts.count(), 1)
})

test('a headerless POST (every other test in this package) is a non-browser caller and passes', async () => {
  await assert.rejects(viewData(pc({ pathname: '/posts/new', method: 'POST', body: { title: 'CLI', _table: 'posts' } })))
  assert.equal(await db.posts.count(), 1)
})

test('an allowlisted origin (the shared csrf config key) writes too', async () => {
  configureCsrf({ allowedOrigins: ['https://trusted.example.com'] })
  await assert.rejects(
    viewData(pc({ pathname: '/posts/new', method: 'POST', body: { title: 'Trusted', _table: 'posts' }, headers: { origin: 'https://trusted.example.com' } })),
  )
  assert.equal(await db.posts.count(), 1)
})

// --- csrfRequestOf: the two request surfaces --------------------------------------------

test('csrfRequestOf hands a server adapter Web Request over as-is', () => {
  const web = new Request('http://x/posts', { method: 'POST' })
  assert.equal(csrfRequestOf({ _reqWeb: web }), web)
})

test('csrfRequestOf wraps the raw Node dev request: method, headers, absolute http url', () => {
  const nodeReq = {
    method: 'POST',
    url: '/posts/new',
    headers: { host: 'localhost:3000', origin: 'https://evil.example.com', 'x-arr': ['a', 'b'] },
    socket: {},
  }
  const wrapped = csrfRequestOf({ _nodeDev: { req: nodeReq } })
  assert.equal(wrapped.method, 'POST')
  assert.equal(wrapped.url, 'http://localhost:3000/posts/new')
  assert.equal(wrapped.headers.get('origin'), 'https://evil.example.com')
  assert.equal(wrapped.headers.get('x-arr'), null) // non-string header values are dropped, never joined
})

test('csrfRequestOf is null when nothing is surfaced (prerender): no browser, no CSRF', () => {
  assert.equal(csrfRequestOf({}), null)
})

test('self-installs vike-csrf next to vike-schema; values only, no meta re-declaration', async () => {
  const { default: reactConfig } = await import('../react/+config.js')
  assert.deepEqual(reactConfig.extends, [
    'import:@vike-data/vike-schema/config:default',
    'import:vike-csrf/config:default',
  ])
  assert.equal(reactConfig.meta?.csrf, undefined)
  assert.equal(reactConfig.meta?.csrfExempt, undefined)
})
