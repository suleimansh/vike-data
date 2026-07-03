// The run orchestration behind an action button/form: confirm -> resolve param tokens -> POST ->
// apply the onSuccess effect (or surface the error). Plain JS with every dependency injectable, so
// it node-tests without a DOM; ActionsProvider just wraps it as the vike-blocks runner value. Shared
// shape for React and Vue.
import { callAction } from './callAction.js'
import { applyEffect, defaultHandlers } from './effects.js'
import { resolveParams } from '../params.js'

// name -> confirm text (or null) from the defineAction refs an ActionsProvider is handed. Shared by
// the React and Vue providers so the two can't drift.
export function buildConfirms(actions) {
  return new Map((Array.isArray(actions) ? actions : []).filter((a) => a?.name).map((a) => [a.name, a.confirm ?? null]))
}

export function createRunner({
  context = {}, // data buckets for $row.id / $record.x token resolution (a table row provides its own)
  confirmFor = () => null, // name -> confirm text (or null); ActionsProvider builds it from the action refs
  confirm = (message) => (globalThis.confirm ? globalThis.confirm(message) : true),
  handlers,
  onError,
  onResult,
  fetchImpl,
  basePath,
} = {}) {
  const effects = handlers ?? defaultHandlers()
  return async function run(name, params) {
    const confirmText = confirmFor(name)
    if (confirmText && !confirm(confirmText)) return { ok: false, cancelled: true }

    const resolved = resolveParams(params, context)
    const out = await callAction(name, resolved, { fetchImpl, basePath })

    if (out.ok) {
      applyEffect(out.onSuccess, effects)
      onResult?.(out.result, { name })
    } else {
      // Default: surface the error as an error toast; an app can take over with onError.
      if (onError) onError(out.error, { name, status: out.status })
      else effects.toast?.({ message: out.error, intent: 'error' })
    }
    return out
  }
}
