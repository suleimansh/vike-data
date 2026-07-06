// vike-csrf as a Vike extension. It declares the family's two CSRF config keys, ONCE:
//
//   csrf        the app-wide policy knob: { allowedOrigins: [...], enforce: true|false }.
//               Global and app-set; extensions never touch it.
//   csrfExempt  the cumulative coordination seam: an extension contributes its
//               signature-verified webhook paths itself ('/webhooks/stripe', or a
//               '/webhooks/*' trailing wildcard); apps never list them by hand.
//
// Endpoint extensions install this package via `extends` and call csrfGuard in their
// middleware. MANY of them will, so the extends graph is a diamond, exactly like
// vike-schema's `schemas` (auth + admin + queue + push all pull it in): Vike dedupes the
// shared extension and this meta stays the single declaration. Adopters contribute VALUES
// (`csrfExempt: [...]`), never re-declare the meta.
//
// There is deliberately NO hook here (#718): a hook would be a pointer-import, and the
// client+server ones land in the CLIENT entry, where a transitively-installed package is
// unresolvable. The guard instead reads the resolved values lazily off vike's globalContext
// (index.js), server-only. Both keys are `global` so they resolve app-wide and are readable
// there.
export default {
  name: 'vike-csrf',
  meta: {
    // Plain serializable data (origins are strings), so server env is all it needs.
    csrf: { env: { server: true }, global: true },
    csrfExempt: { env: { server: true }, cumulative: true, global: true },
  },
  csrfExempt: [],
}
