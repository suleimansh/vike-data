# vike-actions

Named, guarded **server actions** referenced from serializable config.

A vike-blocks `button`/`form` can only carry data — a click handler can't be serialized through SSR. So behaviour is referenced **by name**, not inlined:

```js
button('Publish').action('publish').params({ id: '$row.id' })
```

`vike-actions` resolves that name to a handler, authorizes it, validates its input, and runs it behind **one** endpoint: `POST /_actions/<name>`.

## Define an action

```js
import { defineAction } from 'vike-actions'

defineAction('publish', {
  input:  { id: 'string' },                       // optional: a shape, or a validate fn
  guard:  (ctx) => ctx.user?.role === 'editor',   // optional: authorize (default-open)
  confirm: 'Publish this post?',                   // optional: client confirm before running
  onSuccess: 'reload',                             // optional: client hint after success
  async run({ input, user, db }) {                 // required: the behaviour
    await db.posts.update({ id: input.id }, { status: 'published' })
    return { ok: true }
  },
})
```

`defineAction` returns a small serializable reference (`{ name, confirm, onSuccess }`) — no `run`/`guard` leak to the client.

## Wire it

```js
// +config.js
import vikeActions from 'vike-actions/config'
export default { extends: [vikeActions] }
```

Import the module(s) that call `defineAction` on the server so the registry is populated (a side-effect import, like registering a block or a schema).

## Guards compose the existing auth — no new model

A `guard` is a predicate `(ctx) => boolean | Promise<boolean>`, an array of them (AND), or the string `'authed'` (requires a signed-in user). Write it in terms of the primitives you already have:

```js
import { can } from 'vike-rbac'
guard: (ctx) => can(ctx.user, 'posts.publish')          // vike-rbac permission
guard: (ctx) => ctx.user?.id === ctx.input.ownerId       // the owner contract
guard: ['authed', (ctx) => ctx.user.role === 'admin']    // AND
```

A denied action answers `403`. A missing/wrong input answers `400`. An unknown action `404`.

## The endpoint

`POST /_actions/<name>` with a JSON body (the params). It resolves the signed-in user (via vike-auth), runs the action, and returns:

```json
{ "ok": true, "result": { ... }, "onSuccess": "reload" }
```

or `{ "ok": false, "error": "..." }` with the matching status. The endpoint never touches the DB itself — it calls the pure `runAction` (see below).

### Injecting a `db` (or a custom user resolver)

The default endpoint gives an action `{ input, user }`; an action's `run` can import its own repo. To have the endpoint hand every action a `db` (or swap how the user is resolved), build the handler yourself:

```js
import { createActionsHandler } from 'vike-actions'
import { buildDb } from 'vike-view/resolve'

export default createActionsHandler({
  buildContext: async () => ({ db: buildDb(tables) }),
})
```

## Testing without HTTP

`runAction({ name, input, user, db })` is the pure, transport-agnostic core — no HTTP, no Vike — so an action tests directly:

```js
import { runAction } from 'vike-actions'
const out = await runAction({ name: 'publish', input: { id: 7 }, user, db })
// { ok: true, status: 200, result, onSuccess }
```

## Client bindings

`vike-actions/react` and `vike-actions/vue` (a fast-follow) fill the vike-blocks action seam: a button click POSTs to `/_actions/<name>`, handling `confirm` / optimistic UI / `onSuccess`. Until then a bare action button is inert (and an action form falls back to its native POST).
