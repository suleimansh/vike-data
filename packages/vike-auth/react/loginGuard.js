// React's /login guard is the framework-agnostic guard (reads only Vike's pageContext),
// so it re-exports the shared implementation. Kept as a subpath (vike-auth/react/loginGuard)
// because +config.js references it by pointer import.
export { guard } from '../login-guard.js'
