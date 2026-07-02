// The toast block: an imperative notification (Sonner-shaped). Unlike the descriptor blocks, its core
// is a framework-agnostic store (toast + emitToast / dismissToast / subscribeToasts) that the Toaster
// region renders. The renderers are not node:test-tested (JSX/Vue + portal + animation), so this
// covers the store: emit + variants, the subscribe seam, two-phase dismissal, and auto-dismiss timing
// (via node:test mock timers, since the store schedules with setTimeout).
import { test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { toast, emitToast, dismissToast, subscribeToasts } from '../index.js'
import { TOAST_EXIT_MS, resolveToastIntent } from '../toast-styles.js'

// The store is a module singleton, so every test cleans up its own toasts (dismiss + tick past the exit
// window) before it ends, leaving the store empty for the next.

test('emit adds a toast and notifies subscribers with a snapshot', () => {
  mock.timers.enable({ apis: ['setTimeout'] })
  try {
    let seen = []
    const unsub = subscribeToasts((s) => (seen = s))
    const id = emitToast('Saved', { duration: Infinity })
    assert.equal(typeof id, 'number')
    assert.equal(seen.length, 1)
    assert.equal(seen[0].message, 'Saved')
    assert.equal(seen[0].dismissed, false)
    dismissToast(id)
    mock.timers.tick(TOAST_EXIT_MS)
    assert.equal(seen.length, 0)
    unsub()
  } finally {
    mock.timers.reset()
  }
})

test('dismiss is two-phase: flags dismissed, then hard-removes after the exit window', () => {
  mock.timers.enable({ apis: ['setTimeout'] })
  try {
    let seen = []
    const unsub = subscribeToasts((s) => (seen = s))
    const id = emitToast('Bye', { duration: Infinity })
    dismissToast(id)
    assert.equal(seen.length, 1)
    assert.equal(seen[0].dismissed, true) // still present, animating out
    mock.timers.tick(TOAST_EXIT_MS - 1)
    assert.equal(seen.length, 1)
    mock.timers.tick(1)
    assert.equal(seen.length, 0) // gone after the exit window
    dismissToast(id) // idempotent: dismissing an already-gone toast is a no-op
    assert.equal(seen.length, 0)
    unsub()
  } finally {
    mock.timers.reset()
  }
})

test('a toast auto-dismisses after its duration', () => {
  mock.timers.enable({ apis: ['setTimeout'] })
  try {
    let seen = []
    const unsub = subscribeToasts((s) => (seen = s))
    emitToast('Ephemeral', { duration: 3000 })
    assert.equal(seen.length, 1)
    mock.timers.tick(3000) // duration elapses -> dismiss begins
    assert.equal(seen[0].dismissed, true)
    mock.timers.tick(TOAST_EXIT_MS) // exit elapses -> removed
    assert.equal(seen.length, 0)
    unsub()
  } finally {
    mock.timers.reset()
  }
})

test('the Sonner-shaped variants set the intent; message + bare are neutral', () => {
  mock.timers.enable({ apis: ['setTimeout'] })
  try {
    let seen = []
    const unsub = subscribeToasts((s) => (seen = s))
    toast.success('ok', { duration: Infinity })
    toast.error('no', { duration: Infinity })
    toast.warning('careful', { duration: Infinity })
    toast.info('fyi', { duration: Infinity })
    toast.message('plain', { duration: Infinity })
    toast('bare', { duration: Infinity })
    assert.deepEqual(seen.map((t) => t.intent), ['success', 'error', 'warning', 'info', undefined, undefined])
    for (const t of [...seen]) dismissToast(t.id)
    mock.timers.tick(TOAST_EXIT_MS)
    assert.equal(seen.length, 0)
    unsub()
  } finally {
    mock.timers.reset()
  }
})

test('opts carry description + position; position defaults are left to the Toaster', () => {
  mock.timers.enable({ apis: ['setTimeout'] })
  try {
    let seen = []
    const unsub = subscribeToasts((s) => (seen = s))
    emitToast('Event created', { description: 'Just now', position: 'top-left', duration: Infinity })
    assert.equal(seen[0].description, 'Just now')
    assert.equal(seen[0].position, 'top-left')
    emitToast('No position', { duration: Infinity })
    assert.equal(seen[1].position, undefined) // unset -> the Toaster resolves the default
    for (const t of [...seen]) dismissToast(t.id)
    mock.timers.tick(TOAST_EXIT_MS)
    unsub()
  } finally {
    mock.timers.reset()
  }
})

test('resolveToastIntent maps variants to alert accents; neutral has no icon', () => {
  assert.equal(resolveToastIntent(undefined).icon, null)
  assert.equal(resolveToastIntent('default').icon, null)
  assert.equal(resolveToastIntent('message').icon, null)
  assert.ok(resolveToastIntent('success').accent)
  assert.ok(resolveToastIntent('error').accent) // aliases to danger
  assert.ok(resolveToastIntent('success').icon)
})
