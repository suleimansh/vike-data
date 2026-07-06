// vike-stripe/purchase — the one-time-charge billing MODEL. Installed exactly like
// the subscription model (the subpath default export IS the config; no `/config`):
//
//   import purchase from 'vike-stripe/purchase'
//   export default { extends: [purchase], segment: 'b2b' }
//
// Same parameterization (`segment` re-points the subject FK: 'b2b' -> organizations,
// 'b2c' -> users) and the same composition (self-installs vike-teams); its server
// tier INSERTs a payments row through universal-orm on its webhook. Install it
// alongside the subscription model, or on its own — they are independent Lego pieces.
export default {
  name: 'vike-stripe-purchase',
  extends: ['import:vike-teams/config:default', 'import:vike-csrf/config:default'],
  meta: {
    segment: { env: { config: true, server: true } },
    // Optional override for the subject FK's TARGET table (the app passes a renamed
    // subject table here; unset = the segment default, users/organizations). Build-time
    // only, like the schema itself.
    subjectTable: { env: { config: true, server: true } },
  },
  segment: 'b2b',
  schemas: 'import:vike-stripe/purchase/schemas:default',
  middleware: 'import:vike-stripe/purchase/middleware:default',
  // CSRF (#707): the webhook is signature-verified and not cookie-authenticated, so it
  // self-declares on vike-csrf's cumulative exemption seam; apps never list it. The literal
  // mirrors PURCHASE_WEBHOOK_PATH (middleware.js), which config can't import (it pulls the runtime tier).
  csrfExempt: ['/stripe/purchase/webhook'],
}
