// The action seam (#385) for Vue — the twin of react/action-context.js. A block carrying an
// `action` name reads a `run(name, params)` from provide/inject; vike-actions/vue supplies the real
// one via `provideActionRunner`. The DEFAULT is inert (`enabled: false`, a no-op `run`), so a block
// with no provider stays passive (an action button does nothing; an action form falls back to its
// native POST). The injection KEY lives HERE so both packages share one identity.
import { inject, provide } from 'vue'

const inert = { enabled: false, run: async () => {} }

export const ACTION_RUNNER_KEY = Symbol.for('vike-blocks.action-runner')

// Read the current runner (the inert default when nothing was provided).
export const useActionRunner = () => inject(ACTION_RUNNER_KEY, inert)

// vike-actions/vue calls this in a wrapper component's setup to fill the seam.
export const provideActionRunner = (runner) => provide(ACTION_RUNNER_KEY, runner)
