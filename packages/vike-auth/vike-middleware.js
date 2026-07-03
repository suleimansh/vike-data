// The wired middleware entry referenced from +config.js via the pointer import
// `import:vike-auth/middleware:default`. It binds the reusable factory
// (middleware.js) to the default in-memory auth instance (instance.js).
//
// A real app that wants a database-backed store would call createAuthMiddleware
// with its own auth instance instead of using this default — see index.js.
import { auth } from './instance.js'
import { createAuthMiddleware } from './middleware.js'
import { devServerFlags } from './dev-flags.js'

// Fail closed: the shared derivation gives a non-Secure cookie + inline magic-link
// convenience only on the local dev server (see dev-flags.js). Forgetting
// NODE_ENV=production can no longer ship the 30-day session cookie over plain HTTP.
export default createAuthMiddleware(auth, devServerFlags())
