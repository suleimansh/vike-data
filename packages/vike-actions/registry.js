// The action registry — the open set of named actions the app (and other extensions) define. An
// ACTION is a piece of server behaviour referenced BY NAME from serializable config (a vike-blocks
// button/form carries the name, never a closure); the endpoint resolves the name to this definition
// and runs it. Mirrors vike-blocks' registerBlock/defineBlock and vike-auth's defineGuard: one
// `defineAction` call ships a new action, no central list to keep in sync.
//
//   defineAction('publish', {
//     input:  { id: 'string' },                 // optional: a shape (or a validate fn)
//     guard:  (ctx) => ctx.user?.role === 'editor',   // optional: authorize (see guard.js)
//     confirm: 'Publish this post?',             // optional: client confirm before running
//     onSuccess: 'reload',                       // optional: client hint after success
//     async run({ input, user, db }) {           // required: the behaviour
//       await db.posts.update({ id: input.id }, { status: 'published' })
//       return { ok: true }
//     },
//   })

const REGISTRY = new Map()

// Register (or override) an action. `run` is required; everything else is optional. Throws on a bad
// name/def so a typo is a clear error, not a silently missing action. A later call wins, so an app
// can override an action a preset shipped.
export function registerAction(name, def = {}) {
  if (typeof name !== 'string' || !name) throw new Error('registerAction: a non-empty string name is required')
  if (def == null || typeof def !== 'object') throw new Error(`registerAction(${JSON.stringify(name)}): def must be an object`)
  if (typeof def.run !== 'function') throw new Error(`registerAction(${JSON.stringify(name)}): def.run must be a function`)
  if (def.guard != null && typeof def.guard !== 'function' && typeof def.guard !== 'string' && !Array.isArray(def.guard)) {
    throw new Error(`registerAction(${JSON.stringify(name)}): def.guard must be a function, an array of guards, or a string`)
  }
  if (def.input != null && typeof def.input !== 'function' && typeof def.input !== 'object') {
    throw new Error(`registerAction(${JSON.stringify(name)}): def.input must be a shape object or a validate function`)
  }
  REGISTRY.set(name, {
    name,
    run: def.run,
    input: def.input ?? null,
    guard: def.guard ?? null,
    confirm: def.confirm ?? null,
    onSuccess: def.onSuccess ?? null,
  })
  return def
}

// The primary authoring entry: register an action and return a small SERIALIZABLE reference
// ({ name, confirm, onSuccess }) — enough for a renderer/binding to wire a button (the name) and its
// client UX (confirm/onSuccess) without shipping the server `run`/`guard`.
export function defineAction(name, def) {
  registerAction(name, def)
  const stored = REGISTRY.get(name)
  return { name: stored.name, confirm: stored.confirm, onSuccess: stored.onSuccess }
}

export const getAction = (name) => REGISTRY.get(name) ?? null
export const hasAction = (name) => REGISTRY.has(name)
export const listActions = () => [...REGISTRY.keys()]

// Test/utility: forget every registered action (isolates a test from the module-global registry).
export const clearActions = () => REGISTRY.clear()
