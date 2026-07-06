// vike-actions as a Vike extension: it installs the invocation middleware that owns
// `POST /_actions/<name>`. The app still imports the module(s) that call `defineAction` (a
// side-effect import, like registering a block or a schema) so the registry is populated on the
// server; this config only wires the endpoint. There is no cumulative config point — actions
// compose through the registry, not a central list.
//
// It self-installs vike-csrf: the endpoint is cookie-authenticated + state-mutating, so it
// calls csrfGuard + requireJsonContent by default (endpoint.js). Installing vike-actions
// alone is protected; the app tunes policy through the shared `csrf` config key.
export default {
  name: 'vike-actions',
  extends: ['import:vike-csrf/config:default'],
  middleware: 'import:vike-actions/endpoint:default',
}
