// Vike's once-per-server hook: the whole server-side assembly of the reference app.
//   1. Real database: open the persistent pglite connection, apply migrations, register the
//      Drizzle adapter (every extension then reads/writes Postgres through the same repository).
//   2. Reference data: seedRbac so a fresh clone has a working RBAC model before `pnpm db:seed`.
//   3. Delivery: swap the dev console/outbox transports for Resend / Web Push when their secrets
//      are present, and install the mail + push notification channels (self-registering imports).
//   4. Actions: import the app's action module for its side-effect, populating the registry
//      vike-actions' endpoint resolves names against.
//
// onCreateGlobalContext is isomorphic (it also runs in the browser), so everything sits inside
// `if (import.meta.env.SSR)` with dynamic imports: Vite replaces that with `false` in the client
// build and drops the branch, keeping pglite's wasm, node:crypto and the transports out of the
// client bundle.
export default async function onCreateGlobalContext() {
  if (import.meta.env.SSR) {
    const { getAdapter } = await import('@universal-orm/core')
    if (getAdapter()) return // idempotent across dev HMR / double-eval

    const { migrate } = await import('drizzle-orm/pglite/migrator')
    const { registerDrizzle } = await import('vike-drizzle')
    const { seedRbac } = await import('vike-rbac/seed')
    const { openDb, MIGRATIONS_DIR } = await import('../db/connection.js')
    const { appPermissions, standaloneRoles } = await import('../db/permissions.js')

    const { db, schema } = await openDb()
    await migrate(db, { migrationsFolder: MIGRATIONS_DIR }) // Tier 1
    const adapter = registerDrizzle(db, schema)
    await seedRbac(adapter, appPermissions, { roles: standaloneRoles }) // Tier 2

    // Real transports when configured; otherwise the dev console/outbox transports stay, so the
    // app runs with zero secrets and upgrades to live delivery by filling in .env (see .env.example).
    const env = process.env
    if (env.RESEND_API_KEY) {
      const { setMailTransport } = await import('vike-mail')
      const { resendTransport } = await import('vike-mail/resend')
      setMailTransport(resendTransport({
        apiKey: env.RESEND_API_KEY,
        from: env.RESEND_FROM || 'Noticeboard <onboarding@resend.dev>',
      }))
    }
    if (env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
      const { setPushTransport } = await import('vike-push')
      const { webPushTransport } = await import('vike-push/web-push')
      setPushTransport(webPushTransport({
        subject: env.VAPID_SUBJECT || 'mailto:demo@example.com',
        vapidPublicKey: env.VAPID_PUBLIC_KEY,
        vapidPrivateKey: env.VAPID_PRIVATE_KEY,
      }))
    }

    // Channels: importing an adapter package registers its channel (mail -> sendMail,
    // push -> sendPush); the database channel is built into vike-notifications itself.
    // (The app's actions register through the middleware pointer, server/actions-endpoint.js.)
    await import('vike-notifications-mail')
    await import('vike-notifications-push')
  }
}
