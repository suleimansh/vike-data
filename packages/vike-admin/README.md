# vike-admin

A working admin panel on install. Add `vike-admin/react`, contribute a resource or two, and get `/admin/*` pages that **list, create, edit, and delete** the rows of every table your extensions composed, gated by auth, rendered in your themed layout. It writes no ORM code.

This is "declare intent, derive implementation": the composed schema is the intent, the admin UI is **derived**, and a resource is the **refinement**.

## Install

```js
// +config.js
import admin from 'vike-admin/react'
import { usersResource } from './admin.js'

export default {
  extends: [admin /* , auth, themes, layouts, ... */],
  adminResources: [usersResource], // cumulative: composes with every extension's
}
```

Installing `vike-admin/react` brings the `/admin/*` pages (via `config.pages`) and opens the cumulative `adminResources` seam. There is no central `.resources([...])` registry: resources compose like `schemas` and `themes`.

## Define a resource

```js
import { defineResource, column, display, field } from 'vike-admin/define'

export const usersResource = defineResource({
  table: 'users',          // a table in the COMPOSED schema, not a Model class
  label: 'Users',
  // The screen vocabulary matches defineCrud: index (list), view (detail), edit (the form).
  index: [
    column('email').sortable().searchable(),
    column('created_at').format('since'),
  ],
  view: [display('email'), display('name')],
  edit: [
    field('email').type('email').required(),
    field('name'),         // type inferred from the schema
    // id / *_hash / timestamps auto-hidden by convention
  ],
  // Per-screen gates (missing = allowed). canIndex/canCreate take (ctx); canView/canEdit/canDelete
  // take (record, ctx) — the loaded row plus ctx. All evaluated server-side.
  canIndex: (ctx) => !!ctx.user,
  canEdit: (record, ctx) => ctx.user?.role === 'admin',
  // Row scoping: `query(q, ctx)` bounds a user to their OWN rows; `onCreate(ctx)` stamps the owner
  // onto inserts. Return the builder unrefined for full access (encode the admin bypass here).
  query: (q, ctx) => (ctx.user?.role === 'admin' ? q : q.where('user_id', ctx.user.id)),
  onCreate: (ctx) => ({ user_id: ctx.user.id }),
})
```

Minimal case: `defineResource({ table: 'subscriptions' })` derives every column and field from the schema. The `index` / `view` / `edit` refinements are optional.

### Presentation: route or dialog

`mode` picks how a resource's view / create / edit screens present:

```js
defineResource({ table: 'tags', mode: 'dialog' }) // overlay on the list; 'route' is the default
```

- `'route'` (default): each screen is its own page (`/admin/:table/:id`, `/:id/edit`, `/new`). Full navigation, works with no client JS.
- `'dialog'`: the screens open as an overlay ON the list route, driven by a shareable, refresh-safe URL param (`/admin/:table?view=@id` / `?edit=@id` / `?create`). The forms still POST to the `/new` and `/:id/edit` routes, so it is the same write path, just presented in a modal.

Dialog rendering works on **React and Vue** (both reuse vike-blocks' `Overlay`). `mode` mirrors vike-crud's `defineCrud({ mode })`, but admin defaults to `'route'` (route-per-page is admin's natural shape) where a per-page vike-crud defaults to `'dialog'`.

### Row scoping

`query(q, ctx)` is a query-builder callback (equality + `in`, mirroring universal-orm's surface) that bounds **every** read for a resource to the user's own rows: it is AND-merged into the list (and its count), the edit load, update and delete. Its scalar columns are also forced onto writes, and `onCreate(ctx)` adds a write stamp forced onto inserts (so a user can neither create a row owned by someone else nor reassign ownership). Return the builder unrefined (`(q) => q`) for full access, so the admin bypass lives in the function itself. A resource with no `query` is unscoped. This is how `/admin` doubles as a self-service view: each user sees and edits only what they own.

### Per-field visibility

`.when(ctx)` on any `column()` / `display()` / `field()` shows it only when the predicate is truthy — evaluated server-side, so a hidden column's data never reaches the client and a hidden form field is not writable.

## How it works

- **Pages** (`config.pages`): `/admin` (dashboard), `/admin/:table` (list), `/admin/:table/new` (create), `/admin/:table/:id` (read-only view), `/admin/:table/:id/edit` (edit + delete).
- **Schema introspection**: each page's `data` hook resolves the merged schema (`resolveAdminTables`, which delegates to vike-crud's `resolveViewTables`) and derives columns/fields a resource omits, auto-hiding `id` / `*_hash` / timestamps.
- **Data**: reads/writes go through [universal-orm](../universal-orm) (`db.<table>.find` / `.insert`) on whatever adapter the app registered (memory for dev, Drizzle for real). No ORM is imported.
- **Write POSTs**: the write routes own their own POST. Vike hands the Web Request as `pageContext._reqWeb`, so `/admin/:table/new` renders the form (GET) and inserts (POST), and `/admin/:table/:id` renders the edit form (GET) and updates or deletes (POST), then redirects. No separate endpoint.
- **Auth**: a `guard` fences `/admin/*` to signed-in users (`pageContext.user`, from vike-auth); per-resource `canIndex` / `canCreate` / `canView` / `canEdit` / `canDelete` refine access per screen, and `query` / `onCreate` (above) bound which rows a user sees and can write.
- **Foreign-key labels & pickers**: a FK column is shown by its target's `recordTitle` (a `owner_id` renders the owner's email, not a uuid) and a FK form field becomes a `<select>` of the target rows. This enrichment mirrors the user's **list access** to the target: the target must be a registered resource the user may `canIndex`, and it is bounded by that resource's own `query` scope. A FK whose target is not a registered, indexable resource shows the raw key and offers no picker options (it never enumerates a table the user couldn't list) — register the target as a resource to enable the label/picker.

## Agent API (JSON)

The same admin, as machine-readable JSON, for an AI agent (or any HTTP client) acting on a user's behalf. Read:

- `GET /admin.json`: the resources the caller may view (the dashboard, as JSON).
- `GET /admin/<table>.json`: a resource list. Pass the narrow universal-orm query as `?query=`, a URL-encoded JSON object: `{ filter, orderBy, limit, offset }` (equality + `in` only, the same surface as the rest of universal-orm). Discrete `?page` / `?sort` / `?dir` also work.

Write (the row scope is forced, so a caller only ever writes their **own** rows):

- `POST /admin/<table>.json` with a JSON body: create a row. `201` + the created row.
- `PATCH /admin/<table>/<id>.json` with a JSON body: update a row by its primary key (partial, only the supplied fields). `200` + the updated row.
- `DELETE /admin/<table>/<id>.json`: delete a row by its primary key. `200` `{ "deleted": true }`.

```bash
curl --cookie "$SESSION" \
  "http://localhost:3000/admin/sessions.json?query=$(jq -rR @uri <<<'{"filter":{"active":true},"orderBy":"created_at","limit":20}')"

curl --cookie "$SESSION" -X POST -H 'Content-Type: application/json' \
  -d '{"token":"sess_abc"}' http://localhost:3000/admin/sessions.json
```

This is **not** a second surface with its own auth. Every `.json` endpoint renders the matching admin page through Vike, so it runs the **exact same pipeline** as the browser UI: vike-auth resolves the user, vike-rbac enriches roles/permissions, the guard runs, and the page's own data hook (`listData` for reads, `newData` / `editData` for writes) applies the same `scope(user)` AND-merge, `canView` / `canEdit` allow-list and ownership-forcing. It then returns that data as JSON instead of HTML. So:

- the caller's `?query=` can only ever **narrow within the row scope**, never widen past what the UI would show (scope is AND-merged last);
- a write forces the scope's owner columns onto inserts and keys updates / deletes on the primary key **and** the scope, so a caller can't create a row for someone else, reassign ownership, or touch another owner's row (an id-guess is a `404`);
- a non-viewable / non-editable / unknown resource **404**s, an anonymous caller **401**s, a bad `?query=` or JSON body is a **400** with a message: the same gates as the UI, no second authorization to get wrong;
- rows (read and written-back) are projected to the resource's **visible columns** (+ the primary key), so a hidden column (a password hash) never leaks and is never writable.

It reuses the session cookie; API-token auth for headless agents is a follow-up.

## Server-env config

`adminResources` is **server** config (not client): the admin is SSR + form POSTs, so a resource's functions (`canView` / `canEdit`, builders) stay server-side and nothing serializes to the client. Each data hook derives a plain, serializable view-model.

## Packaging

`vike-admin` is a **preset over [`vike-crud`](../vike-crud)**. vike-crud owns the reusable
engine (schema → columns/fields derivation, projection, the validated list query, the
owner-scoped reads/writes, and the `ListView` / `FormFields` / widget renderers); several
`vike-admin/*` entry points (`define`, `project`, `query`, `react/widgets`, `react/FormFields`)
are thin re-exports of it. vike-admin adds only the admin-specific pieces on top: the cumulative
`adminResources` seam, the `/admin/*` pages + auth guard, and the JSON agent API. Splits the
usual way: `vike-admin` core (framework-agnostic) + `vike-admin/react` (and `/vue`) for the UI.

Reach for `vike-crud` directly to render a single table's screens at your own routes; reach for
`vike-admin` when you want the whole-DB panel.

## Known limits (MVP)

- Queries are the narrow universal-orm surface: equality / `in` filters, single-column `orderBy`, `limit` / `offset` (no joins, ranges, OR, or raw SQL; drop to the ORM for those).
- The agent API does full read + write (GET / POST / PATCH / DELETE) but reuses the session cookie; API-token auth for headless agents is a follow-up.
- Per-type form fields, searchable/async FK selects, and role auth beyond `canView` / `canEdit` / `scope` are follow-ups (see issue #53).
