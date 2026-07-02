// The onSuccess effect interpreter (react/effects.js). Handlers are injected as spies, so this tests
// the vocabulary -> side-effect mapping without a DOM or the toast store.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { applyEffect } from '../react/effects.js'

function spies() {
  const calls = { reload: 0, redirect: [], toast: [] }
  return {
    calls,
    handlers: {
      reload: () => calls.reload++,
      redirect: (p) => calls.redirect.push(p),
      toast: (t) => calls.toast.push(t),
    },
  }
}

test('null / undefined effect does nothing', () => {
  const { calls, handlers } = spies()
  applyEffect(null, handlers)
  applyEffect(undefined, handlers)
  assert.deepEqual(calls, { reload: 0, redirect: [], toast: [] })
})

test('string shorthands: reload / redirect: / toast:', () => {
  const { calls, handlers } = spies()
  applyEffect('reload', handlers)
  applyEffect('redirect:/posts', handlers)
  applyEffect('toast:Published!', handlers)
  assert.equal(calls.reload, 1)
  assert.deepEqual(calls.redirect, ['/posts'])
  assert.deepEqual(calls.toast, ['Published!'])
})

test('object form runs each key (toast, redirect, reload)', () => {
  const { calls, handlers } = spies()
  applyEffect({ toast: 'Saved', redirect: '/x', reload: true }, handlers)
  assert.deepEqual(calls.toast, ['Saved'])
  assert.deepEqual(calls.redirect, ['/x'])
  assert.equal(calls.reload, 1)
})

test('an object toast passes through (title/variant handled downstream)', () => {
  const { calls, handlers } = spies()
  applyEffect({ toast: { title: 'Published', variant: 'success' } }, handlers)
  assert.deepEqual(calls.toast, [{ title: 'Published', variant: 'success' }])
})

test('an unknown string is ignored (not a crash)', () => {
  const { calls, handlers } = spies()
  applyEffect('mystery', handlers)
  assert.deepEqual(calls, { reload: 0, redirect: [], toast: [] })
})
