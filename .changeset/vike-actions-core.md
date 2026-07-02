---
'vike-actions': minor
---

New package **vike-actions** — named, guarded server actions referenced from serializable config (#489, part of the actions axis #385).

A vike-blocks button/form carries an action NAME (a click handler can't survive SSR); vike-actions resolves the name to a handler, authorizes it, validates its input, and runs it behind one `POST /_actions/<name>` endpoint.

- `defineAction(name, { input?, guard?, run, confirm?, onSuccess? })` — registry mirroring `defineBlock`; returns a serializable reference (no `run`/`guard` leaks to the client).
- `runAction({ name, input, user, db })` — the pure, transport-agnostic executor (validate -> guard -> run -> a `{ ok, status, ... }` envelope), unit-testable with a fake user/db.
- Guards compose the existing auth (a predicate over `vike-rbac`'s `can`, the owner contract, or `ctx.user`; arrays AND-merge; `'authed'` shorthand) — no new authz model.
- Input validation is a shape (`{ id: 'string' }`) or a validate function (compose vike-schema).
- One `@universal-middleware` endpoint (same shape as vike-admin's JSON API); `createActionsHandler({ resolveUser?, buildContext? })` injects a custom user resolver or a per-request `db`.

Per-framework client bindings (`vike-actions/react`, `/vue`) that drive the endpoint from a button click are a fast-follow; until then a bare action button is inert.
