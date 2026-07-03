# @vike-data/kit

Authoring primitives for vike-data extensions: the small, framework-agnostic helpers our extensions kept rewriting by hand. Zero dependencies, no Vike imports. This is a building block (like `@universal-orm/core`), not an extension an app installs.

## `createPort`

The runtime provider registry every channel/adapter needs: let the app plug in a live provider (an ORM adapter, a queue driver, a mail/push transport), fall back to a zero-config default, validate on set. Written once here so the globalThis-Symbol caching is correct in one place.

```js
import { createPort } from '@vike-data/kit'

const transport = createPort({
  name: 'vike-mail.transport',          // stable key; same name -> same slot
  validate: (t) => {                     // throws a clear error on invalid input
    if (typeof t?.send !== 'function') throw new Error('setMailTransport: expected a transport with a send() method')
  },
  default: () => consoleTransport,       // lazy zero-config default (omit for none -> get() returns null)
})

export const setMailTransport = (t) => transport.set(t)
export const getMailTransport = () => transport.get()   // the set value, else the cached default
export const clearMailTransport = () => transport.clear()
```

This is the same shape as universal-orm's `setAdapter` / `getAdapter` / `clearAdapter`, generalized.

## `createOutbox`

The in-memory "what would have been sent" buffer a dev transport records into (mail/push), kept on globalThis so module duplication can't fork it.

```js
import { createOutbox } from '@vike-data/kit'

const outbox = createOutbox('vike-mail')
outbox.record(message)   // a dev transport captures here
outbox.get()             // inspect (tests / a dev UI)
outbox.clear()           // reset (tests)
```

## `resolveOwner`

The shared **owner contract** (#250): the one vocabulary behind "let this extension's rows be owned by an *organization*, not just the auth user." An owned-row extension passes its default owner table (its resolved auth subject) and the app's opt-in binding; it gets back `{ ownerTable, ownerColumn }` to build the FK from.

```js
import { resolveOwner } from '@vike-data/kit'

// no binding -> the single-owner default: { ownerTable: 'users', ownerColumn: 'user_id' }
resolveOwner('users')

// app opts in to org ownership -> { ownerTable: 'organizations', ownerColumn: 'organization_id' }
resolveOwner('users', { table: 'organizations', column: 'organization_id' })
```

It is the OWNER axis, **orthogonal** to a subject *rename*: a rename (vike-auth's `resolveSubject`, or a named guard) changes which table the fixed `user_id` FK targets; an owner binding can ALSO swap the **column** to a different *kind* of owner. This is exactly the move [vike-stripe's `segment`](../vike-stripe/README.md) makes flipping `user_id`/`users` ↔ `organization_id`/`organizations` — lifted here so the owned-row extensions express "who owns this row" with ONE vocabulary instead of re-deriving stripe's `segment`/`subjectColumn` per package.

`resolveOwner` is **pure** (no env, no globals): the build half. Each consumer adds the runtime half — `VIKE_<PKG>_OWNER_COLUMN` (where to write/scope the owner id) and `VIKE_<PKG>_OWNER_FROM` (which field of the signed-in user holds it, e.g. `current_organization_id`) — and resolves a `403 no-owner` when a signed-in user has no org. A blank table/column falls through to the default, and the column defaults to `DEFAULT_OWNER_COLUMN` (`user_id`), so a consumer that passes no binding stays byte-for-byte its single-owner self. See the "Owned by a team" section in [vike-storage](../vike-storage/README.md#owned-by-a-team-not-a-user-storageowner-250), [vike-push](../vike-push/README.md), and [vike-notifications](../vike-notifications/README.md) for the worked end-to-end binding, and [AUTHORING.md](../../AUTHORING.md#2-own-your-tables-the-stem-pattern) for the authoring pattern.

The runtime half of the contract also lives here: `DEFAULT_OWNER_COLUMN` (`'user_id'`),
`resolveOwnerColumn(value, default?)` (an env-or-default column name), and
`resolveOwnerId(user, { from, subjectTable, adapter })` (read the owner id off the signed-in
user, or look it up) — the pieces each owned-row extension composes with `resolveOwner`.

## `createDevTransport`

A ready-made dev transport for a port (mail/push): its `transport.send(...)` records the message
into a `createOutbox` (via your `entry` extractor) and logs a friendly `line`. What a channel
installs as its default transport so dev "just works" with no real provider configured.

```js
import { createDevTransport } from '@vike-data/kit'

const dev = createDevTransport({ name: 'vike-mail', entry: (m) => m, line: (m) => `mail -> ${m.to}` })
setMailTransport(dev.transport)   // install as the default transport
dev.getOutbox()                   // inspect captured messages (tests / a dev UI); dev.clearOutbox() resets
```

## `createComponentRegistry` / `createFieldWidgetRegistry`

A per-framework, cross-package `token -> component` registry, keyed by a `(namespace, name)` pair
and kept on globalThis so module duplication can't fork it. The mechanism behind vike-blocks'
`registerBlockRenderer` and vike-crud's field widgets: a schema declares intent (a block type, a
widget token), each framework binding registers the component that draws it, and any consumer of
the same `(namespace, name)` sees it — so a package teaches every consumer a new kind by
registering once. Components are held opaque (kit never renders them), so this stays JSX-free.
`createFieldWidgetRegistry(name)` is the thin `namespace: 'fieldWidgets'` shorthand.

```js
import { createComponentRegistry } from '@vike-data/kit'
const blocks = createComponentRegistry('blocks', 'react')
blocks.register('rating', Rating)   // blocks.get('rating') -> Rating (or undefined -> caller falls back)
```

## `createSubjectResolver`

Per-field `override > env > default` resolution behind a configurable subject/owner (blank counts
as unset). vike-auth's `resolveSubject` and vike-teams' `resolveTeamSubject` are both built on it.

```js
import { createSubjectResolver } from '@vike-data/kit'
const resolve = createSubjectResolver({ table: 'users', id: 'id' }, { table: 'VIKE_AUTH_USERS_TABLE' })
resolve({ table: 'accounts' })   // override wins; else VIKE_AUTH_USERS_TABLE; else 'users'
```

## `jsonResponse` / `readJsonSafe`

Tiny HTTP helpers for the JSON endpoints: `jsonResponse(status, body)` returns a `Response` with
the JSON body and content-type set; `readJsonSafe(request)` parses a request body to an object,
returning `null` instead of throwing on invalid JSON.

## Used by

`vike-queue` (the driver port), `vike-mail` / `vike-push` (transport ports + dev transports),
`vike-storage` / `vike-push` / `vike-notifications` (the `resolveOwner` owner contract),
`vike-blocks` / `vike-crud` / `vike-admin` (the component / field-widget registries),
`vike-auth` / `vike-teams` (`createSubjectResolver`), and `vike-ai`. A new channel, adapter, or
renderer writes a few lines instead of re-deriving the primitive.
