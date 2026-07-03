// The framework-agnostic toast store — the imperative core of the `toast` block. Unlike every other
// block (a declared `{ block, ... }` descriptor), a toast is FIRED imperatively, the way Sonner works:
// app or action code calls `toast('Saved')` and a mounted `<Toaster>` region renders it. This module
// owns the live toast list, the subscribe seam the Toaster listens on, and the two-phase dismissal
// (mark `dismissed` so the region can animate out, then hard-remove after the exit) — all UI-agnostic,
// so the React and Vue Toasters share one source of truth. Toasts are only ever emitted client-side
// (from an event handler), so this never runs during SSR.
import { TOAST_EXIT_MS } from './toast-styles.js'

let seq = 0
const toasts = [] // the live toasts, oldest first
const listeners = new Set()
const timers = new Map() // id -> the pending auto-dismiss or hard-remove timeout

const notify = () => {
  const snapshot = toasts.map((t) => ({ ...t }))
  for (const fn of listeners) fn(snapshot)
}

const clearTimer = (id) => {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

// Subscribe to the live toast list; the callback fires immediately with the current snapshot and on
// every change. Returns an unsubscribe function. The Toaster region is the only real subscriber.
export function subscribeToasts(fn) {
  listeners.add(fn)
  fn(toasts.map((t) => ({ ...t })))
  return () => listeners.delete(fn)
}

// Hard-remove a toast once its exit animation has played.
function removeToast(id) {
  const i = toasts.findIndex((t) => t.id === id)
  if (i >= 0) {
    toasts.splice(i, 1)
    notify()
  }
  clearTimer(id)
}

// Begin dismissing a toast: flag it `dismissed` (so the region animates it out), then hard-remove it
// after the exit window. Idempotent — a second call (e.g. auto-dismiss racing a manual close) is a no-op.
export function dismissToast(id) {
  const t = toasts.find((x) => x.id === id)
  if (!t || t.dismissed) return
  t.dismissed = true
  notify()
  clearTimer(id)
  timers.set(id, setTimeout(() => removeToast(id), TOAST_EXIT_MS))
}

// Fire a toast. `message` is the headline; `opts` are Sonner-shaped: `description`, `intent`
// (success / error / warning / info; omitted = neutral), `position` (overrides the Toaster's default),
// and `duration` in ms (default 4000; `Infinity` or 0 keeps it until dismissed). Returns the toast id
// so the caller can `toast.dismiss(id)`.
export function emitToast(message, opts = {}) {
  const id = ++seq
  const t = {
    id,
    message,
    ...(opts.description != null ? { description: opts.description } : {}),
    ...(opts.intent != null ? { intent: opts.intent } : {}),
    ...(opts.position != null ? { position: opts.position } : {}),
    duration: opts.duration ?? 4000,
    dismissed: false,
  }
  toasts.push(t)
  notify()
  if (t.duration !== Infinity && t.duration > 0) {
    const timer = setTimeout(() => dismissToast(id), t.duration)
    timers.set(id, timer)
    if (typeof timer.unref === 'function') timer.unref() // don't keep a node process alive for a toast
  }
  return id
}

// The Sonner-shaped imperative API: `toast('Saved')`, `toast.success(...)`, `toast.dismiss(id)`. The
// intent variants are thin wrappers that set `opts.intent`; `toast.message` is the explicit neutral form.
export function toast(message, opts) {
  return emitToast(message, opts)
}
toast.message = (message, opts) => emitToast(message, opts)
toast.success = (message, opts) => emitToast(message, { ...opts, intent: 'success' })
toast.error = (message, opts) => emitToast(message, { ...opts, intent: 'error' })
toast.warning = (message, opts) => emitToast(message, { ...opts, intent: 'warning' })
toast.info = (message, opts) => emitToast(message, { ...opts, intent: 'info' })
toast.dismiss = (id) => dismissToast(id)
