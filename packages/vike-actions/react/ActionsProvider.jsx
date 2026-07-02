// Fills the vike-blocks action seam for React: mounts an `enabled` runner into vike-blocks'
// ActionRunnerProvider, so every action-bearing button/form under it becomes live. Wrap your app (or
// a subtree) once. `actions` are the refs `defineAction` returned ({ name, confirm }) — only their
// client-relevant bits, used to prompt a confirm before running. `context` supplies the data buckets
// for `$row.id`-style params (a table row scopes its own; #493). Needs a vike-blocks <Toaster>
// mounted somewhere for the toast effect.
import { useMemo } from 'react'
import { ActionRunnerProvider } from 'vike-blocks/react'
import { createRunner } from '../client/runner.js'

export function ActionsProvider({ children, actions = [], context, basePath, onError, onResult }) {
  const runner = useMemo(() => {
    const confirms = new Map((Array.isArray(actions) ? actions : []).filter((a) => a?.name).map((a) => [a.name, a.confirm ?? null]))
    return {
      enabled: true,
      run: createRunner({ context, confirmFor: (name) => confirms.get(name) ?? null, basePath, onError, onResult }),
    }
  }, [actions, context, basePath, onError, onResult])

  return <ActionRunnerProvider value={runner}>{children}</ActionRunnerProvider>
}
