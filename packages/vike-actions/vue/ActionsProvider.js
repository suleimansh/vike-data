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
    const confirms = buildConfirms(props.actions)
    provideActionRunner({
      enabled: true,
      run: createRunner({
        context: props.context,
        confirmFor: (name) => confirms.get(name) ?? null,
        basePath: props.basePath,
        onError: props.onError,
        onResult: props.onResult,
      }),
    })
    return () => slots.default?.()
  },
}
