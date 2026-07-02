// The imperative composable — the Vue twin of react/useAction.js: `const { run, pending, error } =
// useAction('publish')` for a hand-wired control. Drives the SAME runner the ActionsProvider
// provides; under no provider the injected runner is inert (vike-blocks' default), so `run` no-ops.
import { ref } from 'vue'
import { useActionRunner } from 'vike-blocks/vue'

export function useAction(name) {
  const runner = useActionRunner()
  const pending = ref(false)
  const error = ref(null)

  const run = async (params) => {
    pending.value = true
    error.value = null
    try {
      const out = await runner.run(name, params)
      if (out && out.ok === false && !out.cancelled) error.value = out.error
      return out
    } finally {
      pending.value = false
    }
  }

  return { run, pending, error }
}
