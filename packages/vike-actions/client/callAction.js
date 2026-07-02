// POST an action to the endpoint and normalize the envelope. Framework-agnostic (plain fetch), so
// it unit-tests with an injected fetch — the React/Vue bindings just wrap it with UI state. Never
// throws on an HTTP error: it returns `{ ok:false, error, status }` so the caller branches on data.
export async function callAction(name, params, { fetchImpl, basePath = '/_actions' } = {}) {
  const doFetch = fetchImpl ?? globalThis.fetch
  let res
  try {
    res = await doFetch(`${basePath}/${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params ?? {}),
    })
  } catch (e) {
    return { ok: false, status: 0, result: null, onSuccess: null, error: e?.message ?? 'Network error' }
  }
  let body = null
  try {
    body = await res.json()
  } catch {
    // no/invalid JSON body
  }
  return {
    ok: res.ok && !!body?.ok,
    status: res.status,
    result: body?.result ?? null,
    onSuccess: body?.onSuccess ?? null,
    error: body?.error ?? (res.ok ? null : `Request failed (${res.status})`),
  }
}
