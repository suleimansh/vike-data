import vike from 'vike/plugin'
import vikeI18n from 'vike-i18n/plugin'
import vikeSchema from '@vike-data/vike-schema/plugin'
import { loadEnv } from 'vite'

export default ({ mode }) => {
  // Surface the optional transport secrets (Resend / VAPID, see .env.example) from a local .env
  // file into process.env for the server hook and +config.js. Real env vars already set in the
  // environment take precedence. Unset = the dev console/outbox transports.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ['RESEND_', 'VAPID_']))
  return {
    // vikeSchema() reads Vike's merged `schemas` (vike-auth's users/sessions/login_tokens,
    // vike-rbac's roles/permissions tables, vike-push's push_subscriptions, vike-notifications'
    // notifications, plus this app's announcements) and writes the composed Drizzle schema to
    // drizzle/schema.generated.ts on dev-server start and on build; drizzle-kit derives the SQL
    // migrations from it (pnpm db:generate). Both it and vikeI18n() must come AFTER vike().
    plugins: [vike(), vikeI18n(), vikeSchema()],
    esbuild: { jsx: 'automatic' },
    // Force ONE React copy: the workspace UI packages are served as source and each has its own
    // react peer link, so a cross-package import could otherwise resolve a second React and crash
    // SSR with a null `useContext`.
    resolve: { dedupe: ['react', 'react-dom', 'react/jsx-runtime'] },
    optimizeDeps: {
      exclude: [
        'vike-actions',
        'vike-admin',
        'vike-auth',
        'vike-blocks',
        'vike-i18n',
        'vike-layouts',
        'vike-notifications',
        'vike-push',
        'vike-theme-emerald',
        'vike-themes',
        'vike-toolbar',
      ],
    },
    // pglite ships a wasm Postgres; keep it (and drizzle) out of Vite's dep optimizer and as a
    // server-side external so the wasm/node bits are never pulled into the client bundle.
    ssr: { external: ['@electric-sql/pglite', 'drizzle-orm'] },
    server: { port: 4400, strictPort: true },
  }
}
