// vike-actions as a Vike extension: it installs the invocation middleware that owns
// `POST /_actions/<name>`. The app still imports the module(s) that call `defineAction` (a
// side-effect import, like registering a block or a schema) so the registry is populated on the
// server; this config only wires the endpoint. There is no cumulative config point — actions
// compose through the registry, not a central list.
export default {
  name: 'vike-actions',
  middleware: 'import:vike-actions/endpoint:default',
}
