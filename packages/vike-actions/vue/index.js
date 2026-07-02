// vike-actions/vue — the Vue client binding that fills the vike-blocks action seam and drives the
// /_actions/<name> endpoint from a button click: confirm -> resolve params -> POST -> run the
// onSuccess effect (reload / redirect / toast). Wrap your app in <ActionsProvider>; a vike-blocks
// <Toaster> renders the toasts. The Vue twin of vike-actions/react over one shared client core.
export { ActionsProvider } from './ActionsProvider.js'
export { useAction } from './useAction.js'
export { createRunner } from '../client/runner.js'
export { callAction } from '../client/callAction.js'
export { applyEffect, defaultHandlers } from '../client/effects.js'
