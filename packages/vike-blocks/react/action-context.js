// The action seam (#385) for React. A block that carries an `action` name (button, form) doesn't
// know HOW to run it — behaviour can't live in serializable config. Instead the renderer reads a
// `run(name, params)` from this context; vike-actions/react supplies the real one via
// <ActionRunnerProvider>. The DEFAULT is inert (`enabled: false`, a no-op `run`), so a bare block
// with no provider stays passive: an action button does nothing, and an action form falls back to
// its native POST. The context object lives HERE (not in vike-actions) so both packages share one
// identity — a Provider from vike-actions fills the same context the block renderers consume.
import { createContext, useContext } from 'react'

const inert = { enabled: false, run: async () => {} }

export const ActionRunnerContext = createContext(inert)

// The Provider vike-actions/react renders with `value={{ enabled: true, run }}`.
export const ActionRunnerProvider = ActionRunnerContext.Provider

// Read the current runner (the inert default when no provider is mounted).
export const useActionRunner = () => useContext(ActionRunnerContext)
