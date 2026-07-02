// The imperative hook: `const { run, pending, error } = useAction('publish')` for a hand-wired
// button (outside the block seam). It drives the SAME runner the ActionsProvider mounts, adding
// local pending/error state. Under no provider the runner is inert (vike-blocks' default), so `run`
// safely no-ops.
import { useCallback, useState } from 'react'
import { useActionRunner } from 'vike-blocks/react'

export function useAction(name) {
  const runner = useActionRunner()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)

  const run = useCallback(
    async (params) => {
      setPending(true)
      setError(null)
      try {
        const out = await runner.run(name, params)
        if (out && out.ok === false && !out.cancelled) setError(out.error)
        return out
      } finally {
        setPending(false)
      }
    },
    [runner, name],
  )

  return { run, pending, error }
}
