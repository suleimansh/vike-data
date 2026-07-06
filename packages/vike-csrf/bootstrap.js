// The config -> runtime bridge. A universal middleware cannot read Vike config, so this
// onCreateGlobalContext hook copies the resolved `csrf` + `csrfExempt` values into the
// module-level settings (index.js) once, at globalContext creation. That happens before the
// server handles any request, so csrfGuard never runs against half-configured state.
//
// `csrfExempt` is cumulative: every installed extension contributes its own webhook paths
// (vike-stripe adds its signature-verified webhook route), so the resolved value is an array
// of contributions to flatten. Apps never list an extension's webhooks by hand.
import { configureCsrf } from './index.js'

export default function bootstrapCsrf(globalContext) {
  // The hook is built-in server+client; the settings (and the config values) are server-only.
  if (globalContext.isClientSide) return
  const config = globalContext.config || {}
  const exempt = (config.csrfExempt || []).flat().filter(Boolean)
  configureCsrf({ ...(config.csrf || {}), exempt: [...new Set(exempt)] })
}
