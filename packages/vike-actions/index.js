// vike-actions — named, guarded server actions referenced from serializable config. A vike-blocks
// button/form carries an action NAME (never a closure); this package resolves the name to a handler,
// authorizes it, validates its input, and runs it behind one `POST /_actions/<name>` endpoint. The
// per-framework client bindings (vike-actions/react, /vue) that drive the endpoint from a button
// click are separate subpaths (a fast-follow). See +config.js for the Vike wiring.
export { defineAction, registerAction, getAction, hasAction, listActions, clearActions } from './registry.js'
export { runAction } from './run.js'
export { runGuard } from './guard.js'
export { validateInput, validateShape, ValidationError } from './validate.js'
export { resolveParams, resolveToken } from './params.js'
export { createActionsHandler } from './endpoint.js'
