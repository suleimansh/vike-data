// The integrated reference app: every capability the stack ships, wired together in one product.
// Persistent Postgres (see pages/+onCreateGlobalContext.js + db/), auth + rbac + admin, the full
// UI tier (themes/layouts/toolbar/i18n), and live delivery: vike-notifications fans an announcement
// out to mail + push + the in-app Bell feed. Each capability is an extension installed via
// `extends` with a sibling config key; nothing here changes between the dev outbox transports and
// real Resend/VAPID delivery (that swap lives in +onCreateGlobalContext.js, driven by env vars).
import vikeReact from 'vike-react/config'
import authExt from 'vike-auth/react'
import adminExt from 'vike-admin/react'
import themesExt from 'vike-themes/react'
import layoutsExt from 'vike-layouts/react'
import toolbarExt from 'vike-toolbar/react'
import emeraldExt from 'vike-theme-emerald/config'
import i18nExt from 'vike-i18n/react'
import rbacExt from 'vike-rbac/config'
import pushExt from 'vike-push/config'
import notificationsExt from 'vike-notifications/config'
import { defineTheme } from 'vike-themes'
import { announcementsSchema } from './announcements.schema.js'

// The app's own brand theme, contributed through the cumulative `themes` point exactly like a
// theme package (built-ins + emerald compose in).
const noticeboard = defineTheme({
  name: 'noticeboard',
  fonts: { sans: 'system-ui, sans-serif', mono: 'ui-monospace, monospace' },
  radius: '8px',
  spacing: { sm: '0.5rem', md: '1rem', lg: '2rem' },
  light: {
    bg: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
    primary: '#4338ca',
    'primary-text': '#f8fafc',
  },
  dark: {
    bg: '#0b1120',
    surface: '#131c31',
    text: '#e2e8f0',
    muted: '#8ea0bd',
    border: '#24344a',
    primary: '#818cf8',
    'primary-text': '#0b1120',
  },
})

export default {
  extends: [
    vikeReact,
    authExt,
    adminExt,
    themesExt,
    layoutsExt,
    toolbarExt,
    emeraldExt,
    i18nExt,
    rbacExt,
    pushExt,
    notificationsExt,
  ],

  // The actions endpoint, with an rbac-aware user resolver (see server/actions-endpoint.js for
  // why the app wires this instead of extending vike-actions/config). Importing it also
  // registers the app's actions.
  middleware: ['import:../server/actions-endpoint.js:default'],

  title: 'Noticeboard',

  // The app's own table, contributed to the cumulative `schemas` point exactly like an
  // extension contributes its tables (vike-auth's users/sessions, vike-push's subscriptions,
  // vike-notifications' feed). The vike-schema plugin emits ONE composed Drizzle schema.
  schemas: [announcementsSchema],

  // i18n: English ships inline with the components as the fallback.
  locales: ['en'],
  locale: 'en',

  // themes: pick the active brand + appearance mode (system follows the OS).
  appearance: 'system',
  theme: 'noticeboard',
  themes: [noticeboard],

  // rbac: the role a brand-new magic-link signup is granted on its first request. `member` is
  // seeded by db/seed.js; the resolver assigns it to any signed-in user who has no role yet.
  defaultRoles: ['member'],

  // push: the public half of the VAPID keypair the browser subscribes with; the private key
  // stays server-side in the push transport (+onCreateGlobalContext.js). The fallback is a
  // demo key so the subscribe flow works out of the box (delivery then goes to the dev console).
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || 'BDNJY5tBAEFdFWQFeZjDA0JoEm0MscKeDo5JpxJ1QCm2hv56lroZiHk0a3NEvq6sPJsIBGXOIsyKaf4BRP4aEG4',

  // layout: the app-shell + its slots. The auth /login page sets its own centered layout.
  layout: 'topbar',
  logo: '▤ Noticeboard',
  nav: [
    { label: 'Board', href: '/' },
    { label: 'Post', href: '/announcements/new' },
    { label: 'Admin', href: '/admin' },
    { label: 'Account', href: '/account', end: true },
    { label: 'Login', href: '/login', end: true },
  ],
}
