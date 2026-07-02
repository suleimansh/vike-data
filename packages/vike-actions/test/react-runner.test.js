// The run orchestration (react/runner.js): confirm -> resolve params -> POST -> effect / error. Every
// dependency is injected (fetch, handlers, confirm), so the full click-time flow tests without a DOM.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRunner } from '../react/runner.js'

// A fake fetch that records the request and returns a canned JSON envelope.
function fakeFetch(envelope, { status = 200 } = {}) {
  const calls = []
  const fetchImpl = async (url, init) => {
    calls.push({ url, method: init.method, body: JSON.parse(init.body) })
    return { ok: status >= 200 && status < 300, status, json: async () => envelope }
  }
  return { fetchImpl, calls }
}

function spyHandlers() {
  const calls = { reload: 0, redirect: [], toast: [] }
  return { calls, handlers: { reload: () => calls.reload++, redirect: (p) => calls.redirect.push(p), toast: (t) => calls.toast.push(t) } }
}

test('POSTs to /_actions/<name> with the params as the JSON body', async () => {
  const { fetchImpl, calls } = fakeFetch({ ok: true, result: {}, onSuccess: null })
  const { handlers } = spyHandlers()
  const run = createRunner({ fetchImpl, handlers })
  await run('publish', { id: 7 })
  assert.equal(calls[0].url, '/_actions/publish')
  assert.equal(calls[0].method, 'POST')
  assert.deepEqual(calls[0].body, { id: 7 })
})

test('resolves $row.id params against the provided context before POSTing', async () => {
  const { fetchImpl, calls } = fakeFetch({ ok: true, result: {}, onSuccess: null })
  const { handlers } = spyHandlers()
  const run = createRunner({ fetchImpl, handlers, context: { row: { id: 42 } } })
  await run('del', { id: '$row.id' })
  assert.deepEqual(calls[0].body, { id: 42 })
})

test('applies the onSuccess effect from the envelope on success', async () => {
  const { fetchImpl } = fakeFetch({ ok: true, result: { id: 1 }, onSuccess: { toast: 'Published!', reload: true } })
  const { calls, handlers } = spyHandlers()
  const run = createRunner({ fetchImpl, handlers })
  const out = await run('publish', {})
  assert.equal(out.ok, true)
  assert.deepEqual(calls.toast, ['Published!'])
  assert.equal(calls.reload, 1)
})

test('confirm gate: a declined confirm cancels before any request', async () => {
  const { fetchImpl, calls } = fakeFetch({ ok: true })
  const { handlers } = spyHandlers()
  const run = createRunner({ fetchImpl, handlers, confirmFor: () => 'Sure?', confirm: () => false })
  const out = await run('del', { id: 1 })
  assert.deepEqual(out, { ok: false, cancelled: true })
  assert.equal(calls.length, 0) // never POSTed
})

test('an accepted confirm proceeds to POST', async () => {
  const { fetchImpl, calls } = fakeFetch({ ok: true, onSuccess: null })
  const { handlers } = spyHandlers()
  const run = createRunner({ fetchImpl, handlers, confirmFor: () => 'Sure?', confirm: () => true })
  await run('del', { id: 1 })
  assert.equal(calls.length, 1)
})

test('a failed action toasts the error by default', async () => {
  const { fetchImpl } = fakeFetch({ ok: false, error: 'Forbidden' }, { status: 403 })
  const { calls, handlers } = spyHandlers()
  const run = createRunner({ fetchImpl, handlers })
  const out = await run('publish', {})
  assert.equal(out.ok, false)
  assert.deepEqual(calls.toast, [{ message: 'Forbidden', intent: 'error' }])
})

test('onError takes over error handling when provided (no default toast)', async () => {
  const { fetchImpl } = fakeFetch({ ok: false, error: 'Forbidden' }, { status: 403 })
  const { calls, handlers } = spyHandlers()
  let seen
  const run = createRunner({ fetchImpl, handlers, onError: (e, meta) => (seen = { e, meta }) })
  await run('publish', {})
  assert.equal(seen.e, 'Forbidden')
  assert.equal(seen.meta.status, 403)
  assert.deepEqual(calls.toast, []) // default toast suppressed
})
