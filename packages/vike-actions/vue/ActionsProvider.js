// Fills the vike-blocks action seam for Vue — the twin of react/ActionsProvider.jsx. In setup() it
// provides an `enabled` runner through vike-blocks' provideActionRunner (provide/inject), so every
// action-bearing button/form in the slot goes live. Drives the SAME framework-agnostic runner as the
// React binding (client/runner.js). `actions` are the defineAction refs ({ name, confirm }) used to
// prompt a confirm; `context` supplies the buckets for `$row.id`-style params. Needs a vike-blocks
// <Toaster> mounted for the toast effect.
import { provideActionRunner } from 'vike-blocks/vue'
import { createRunner, buildConfirms } from '../client/runner.js'

export const ActionsProvider = {
  props: ['actions', 'context', 'basePath', 'onError', 'onResult'],
  setup(props, { slots }) {
    // A stable provided object (good for inject identity), but its `run` rebuilds from the CURRENT
    // props on every invocation. Reading props.* inside the closure gets the reactive value at call
    // time, so a Vue app that updates `context`/`actions`/handlers reactively takes effect — the
    // React twin gets this via `useMemo` keyed on the same props; here we always read current.
    provideActionRunner({
      enabled: true,
      run: (name, params) => {
        const confirms = buildConfirms(props.actions)
        return createRunner({
          context: props.context,
          confirmFor: (n) => confirms.get(n) ?? null,
          basePath: props.basePath,
          onError: props.onError,
          onResult: props.onResult,
        })(name, params)
      },
    })
    return () => slots.default?.()
  },
}
