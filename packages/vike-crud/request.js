// Reading a form POST across the two ways Vike surfaces the request (a Web Request on server
// adapters, the raw Node request under `vite dev`), normalized to `{ method, formData() }`. The
// generated view page owns its own POST (no separate endpoint), so it reads the submitted form
// the same way regardless of environment. Framework-agnostic; vike-admin delegates to this via
// the `vike-crud/request` subpath rather than keeping its own copy.
function readNodeBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => resolve(new URLSearchParams(body)))
    req.on('error', reject)
  })
}

export function readFormRequest(pageContext) {
  const web = pageContext._reqWeb
  if (web) return { method: web.method, formData: () => web.formData() }

  const nodeReq = pageContext._nodeDev?.req
  if (nodeReq) return { method: nodeReq.method, formData: () => readNodeBody(nodeReq) }

  // No request surfaced (e.g. prerender) — treat as a non-mutating GET.
  return { method: 'GET', formData: async () => new URLSearchParams() }
}

// The same two-way normalization, shaped for vike-csrf's checks (method + headers + absolute
// url; the body is never touched). A server adapter's Web Request is handed over as-is; the raw
// Node request under `vite dev` is wrapped (dev is plain http, so the scheme is http unless the
// socket is TLS). Returns null when no request is surfaced (prerender): no browser, no CSRF.
export function csrfRequestOf(pageContext) {
  const web = pageContext._reqWeb
  if (web) return web

  const nodeReq = pageContext._nodeDev?.req
  if (nodeReq) {
    const headers = new Headers()
    for (const [name, value] of Object.entries(nodeReq.headers)) {
      if (typeof value === 'string') headers.set(name, value)
    }
    const scheme = nodeReq.socket?.encrypted ? 'https' : 'http'
    const host = nodeReq.headers.host || 'localhost'
    return new Request(`${scheme}://${host}${nodeReq.url}`, { method: nodeReq.method, headers })
  }

  return null
}
