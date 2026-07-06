// CSRF adoption (#702): both admin write surfaces verify the caller through vike-csrf.
// The form POSTs (newData / editData) reject a cross-origin browser with render(403) before
// reading the body; the agent API middleware rejects cross-origin writes with a 403 JSON
// Response and non-JSON bodies with a 415, both BEFORE any page render. Non-browser callers
// (the agent API's audience) send neither Origin nor Sec-Fetch-Site and pass untouched.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { setAdapter, clearAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'
import { resetCsrf } from 'vike-csrf'
import { defineResource, field } from '../define.js'
import { resolveAdminTables, buildDb } from '../resolve.js'
import { newData, editData } from '../data.js'
import { default as adminApi } from '../api.js'
import adminConfig from '../+config.js'

const docsSchema = defineSchema('docs', (t) => {
  t.uuid('id').primary()
  t.string('title')
})
const resource = defineResource({ table: 'docs', edit: [field('title')] })
const config = { schemas: [docsSchema], adminResources: [resource] }
const user = { id: 'u1', role: 'admin' }
const db = () => buildDb(resolveAdminTables(config))

// The scopeInWrite.test.js pageContext, driven by a form POST (_reqWeb) instead of adminApiWrite.
const formCtx = (pathname, { id, headers = {}, body = {} } = {}) => ({
  routeParams: { table: 'docs', ...(id ? { id } : {}) },
  config,
  user,
  _reqWeb: new Request(`http://x${pathname}`, { method: 'POST', headers, body: new URLSearchParams(body) }),
})

const is403Abort = (err) => err._pageContextAbort?.abortStatusCode === 403

beforeEach(() => {
  resetCsrf()
  clearAdapter()
  setAdapter(createMemoryAdapter())
})

// --- the form POSTs (data.js) ------------------------------------------------------------

test('create form: a cross-origin POST -> render(403), no row written', async () => {
  await assert.rejects(
    newData(formCtx('/admin/docs/new', { headers: { origin: 'https://evil.example.com' }, body: { title: 'Forged' } })),
    is403Abort,
  )
  assert.equal((await db().docs.find({})).length, 0)
})

test('create form: a same-origin POST writes and redirects to the list', async () => {
  await assert.rejects(
    newData(formCtx('/admin/docs/new', { headers: { origin: 'http://x' }, body: { title: 'Mine' } })),
    (err) => err._pageContextAbort?._urlRedirect?.url === '/admin/docs',
  )
  assert.equal((await db().docs.find({})).length, 1)
})

test('edit form: a cross-origin POST -> render(403), the row is untouched', async () => {
  await db().docs.insert({ id: 'd1', title: 'original' })
  await assert.rejects(
    editData(formCtx('/admin/docs/d1/edit', { id: 'd1', headers: { origin: 'https://evil.example.com' }, body: { title: 'Defaced' } })),
    is403Abort,
  )
  assert.equal((await db().docs.findOne({ id: 'd1' })).title, 'original')
})

// --- the agent API (api.js) --------------------------------------------------------------

const jsonHeaders = { 'content-type': 'application/json' }

test('agent API: a cross-origin browser write -> 403 JSON, before any render', async () => {
  const res = await adminApi(
    new Request('http://x/admin/docs.json', {
      method: 'POST',
      headers: { ...jsonHeaders, origin: 'https://evil.example.com' },
      body: '{"title":"Forged"}',
    }),
  )
  assert.equal(res.status, 403)
  assert.deepEqual(await res.json(), { error: 'Cross-origin request rejected' })
})

test('agent API: a cross-origin DELETE (no body) -> 403 too', async () => {
  const res = await adminApi(
    new Request('http://x/admin/docs/d1.json', { method: 'DELETE', headers: { origin: 'https://evil.example.com' } }),
  )
  assert.equal(res.status, 403)
})

test('agent API: a non-JSON body -> 415 (the text/plain form-POST trick)', async () => {
  const res = await adminApi(
    new Request('http://x/admin/docs.json', { method: 'POST', body: '{"title":"sneaky"}' }), // defaults text/plain
  )
  assert.equal(res.status, 415)
  assert.match((await res.json()).error, /application\/json/)
})

test('agent API: a DELETE carries no body, so no content-type is demanded of it', async () => {
  // Headerless (a real agent) and bodyless: passes both checks and reaches the render tier,
  // where the missing Vike app surfaces as api.js's own 500. Proof neither check fired.
  const res = await adminApi(new Request('http://x/admin/docs/d1.json', { method: 'DELETE' }))
  assert.equal(res.status, 500)
})

// --- the config seam ----------------------------------------------------------------------

test('self-installs vike-csrf next to vike-schema; values only, no meta re-declaration', () => {
  assert.deepEqual(adminConfig.extends, [
    'import:@vike-data/vike-schema/config:default',
    'import:vike-csrf/config:default',
  ])
  assert.equal(adminConfig.meta.csrf, undefined)
  assert.equal(adminConfig.meta.csrfExempt, undefined)
})
