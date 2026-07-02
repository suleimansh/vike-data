// Interpret an `onSuccess` hint (already resolved to plain data by the core) into side-effects. The
// handlers (navigate / reload / toast) are INJECTED so this is pure and node-testable; the default
// handlers (browser navigation + vike-blocks' toast store) are built by defaultHandlers(). Shared by
// the React and Vue bindings so the effect vocabulary can't drift.
//
// Vocabulary:
//   'reload'                              -> reload the page data
//   'redirect:/path'                      -> client navigate
//   'toast:Message'                       -> a toast
//   { reload, redirect:'/path', toast }   -> object form, each key runs (toast may be a string or
//                                            { title, description, intent | variant })
import { emitToast } from 'vike-blocks'

// Fire one toast from a string or an options object; maps `variant` -> the toast store's `intent`.
function toastEffect(toast, emit) {
  if (typeof toast === 'string') return emit(toast)
  if (toast && typeof toast === 'object') {
    const { title, message, description, intent, variant, ...rest } = toast
    return emit(title ?? message ?? '', { ...rest, description, intent: intent ?? variant })
  }
}

export function applyEffect(effect, handlers = {}) {
  if (!effect) return
  const { reload, redirect, toast } = handlers
  if (typeof effect === 'string') {
    if (effect === 'reload') return reload?.()
    if (effect.startsWith('redirect:')) return redirect?.(effect.slice('redirect:'.length))
    if (effect.startsWith('toast:')) return toast?.(effect.slice('toast:'.length))
    return
  }
  if (typeof effect === 'object') {
    // Toast first (so it shows before a redirect unmounts the page), then redirect, then reload.
    if (effect.toast != null) toast?.(effect.toast)
    if (effect.redirect) redirect?.(effect.redirect)
    if (effect.reload) reload?.()
  }
}

// The browser side-effects: navigate + reload via window.location, toast via vike-blocks' store.
// window is guarded so importing this module is safe on the server (the effects only run on a click).
export function defaultHandlers() {
  return {
    reload: () => globalThis.location?.reload(),
    redirect: (path) => globalThis.location?.assign(path),
    toast: (t) => toastEffect(t, (message, opts) => emitToast(message, opts)),
  }
}
