// End-to-end through the REAL stack (no injected core/endpoint/effects): a client run() POSTs into
// the real universal-middleware endpoint -> runAction resolves the function onSuccess against the
// write result -> the real defaultHandlers fire a real toast through vike-blocks' toast store. Proves
// a toast actually fires; only the literal DOM click + <Toaster> render are browser-only.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { defineAction, clearActions, createActionsHandler } from '../index.js'
import { createRunner } from '../react/runner.js' // the plain module (the barrel pulls JSX, unparseable by node:test)
import { subscribeToasts, dismissToast } from 'vike-blocks'

test('run -> real endpoint -> onSuccess -> a real toast is emitted', async () => {
  clearActions()
  defineAction('publish', {
    onSuccess: (post) => ({ toast: `Published "${post.title}"` }),
    run: async ({ input }) => ({ id: input.id, title: 'Hello' }),
  })

  // Bridge the client fetch straight into the real handler (the wire, minus a network hop).
  const handle = createActionsHandler({ resolveUser: async () => ({ id: 'u1' }) })
  const fetchImpl = (url, init) => handle(new Request('http://x' + url, { method: init.method, headers: init.headers, body: init.body }))

  const seen = []
  const unsub = subscribeToasts((list) => list.forEach((t) => !seen.some((s) => s.id === t.id) && seen.push(t)))

  const run = createRunner({ fetchImpl }) // real defaultHandlers -> real emitToast
  const out = await run('publish', { id: 7 })

  assert.equal(out.ok, true)
  assert.deepEqual(out.result, { id: 7, title: 'Hello' })
  assert.ok(seen.some((t) => t.message === 'Published "Hello"'), `a toast should have fired; saw ${JSON.stringify(seen.map((t) => t.message))}`)

  seen.forEach((t) => dismissToast(t.id)) // don't leave auto-dismiss timers pending across tests
  unsub()
})
