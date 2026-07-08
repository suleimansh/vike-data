# examples/noticeboard

The **integrated reference app**: a team noticeboard that runs the whole stack in one product.
Where the focused examples each prove one capability, this app wires them all together the way a
real internal tool would:

- **Persistent database**: `vike-drizzle` + embedded Postgres (pglite), with real migrations and
  tiered seeding (like [`examples/drizzle-pglite`](../drizzle-pglite))
- **Auth + RBAC**: magic-link sign-in, three roles (admin / editor / member), one `can()` shared
  by the page guard, the publish action, and the admin gates
- **Admin panel**: users, announcements, and sessions resources over the same composed schema
- **Live delivery**: publishing an announcement fans out through `vike-notifications` to the
  in-app Bell feed (database channel), email (`vike-mail`, Resend when configured) and web push
  (`vike-push`, VAPID when configured) - one `notify()` per member
- **UI tier**: themes (brand theme + emerald), layouts (topbar shell), toolbar, i18n

## Run it

```bash
pnpm install        # repo root
cd examples/noticeboard
pnpm dev            # first boot emits drizzle/schema.generated.ts and applies migrations
# stop the server, then:
pnpm db:seed        # roles + ada/erin/alan + a welcome announcement (pglite is single-process)
pnpm dev
```

Open http://localhost:4400, sign in with a magic link (printed to the page + dev console):

| user | role | can |
|---|---|---|
| `ada@example.com` | admin | manage users, post announcements |
| `erin@example.com` | editor | post announcements |
| `alan@example.com` | member | read the board, get notified |

Post an announcement as erin, then sign in as alan (another browser/incognito): it's on his
board, in his Bell, and in the dev mail log. Restart the server - everything is still there.

## Live delivery (real transports)

With no secrets the app uses the dev console/outbox transports. Copy `.env.example` to `.env`
and fill in `RESEND_API_KEY` (mail) and/or the `VAPID_*` keys (web push) to deliver for real -
no code change, the swap lives in `pages/+onCreateGlobalContext.js`.

## How the pieces compose

- `pages/+config.js` - every capability is an extension in `extends` with a sibling config key;
  the app's own `announcements` table is contributed to `schemas` exactly like an extension
  contributes its tables. The composed schema becomes `drizzle/schema.generated.ts` (vike-schema
  plugin), which drizzle-kit turns into the committed SQL migrations.
- `server/actions.js` - the one domain action, `announcements.publish`: rbac-guarded insert +
  one `notify()` per member. `server/notifications.js` is the notification (its `via()` picks
  database + mail + push).
- `server/actions-endpoint.js` - the actions endpoint with an **rbac-aware user resolver**:
  vike-actions' default endpoint resolves the bare session user, so a `can(ctx.user, ...)` guard
  would always deny. The app swaps the resolver (same session lookup + the same
  `resolveAccessForUser` the page path uses) until vike-actions grows that seam.
- `db/` - the tiered seeding story: migrations (tier 1), roles/permissions via `seedRbac`
  (tier 2), sample users + welcome announcement via idempotent `findOrCreate` (tier 3).
  `db/seed.test.js` runs the same chain against an in-memory pglite in CI.

## Caveats

- pglite is single-process: stop the dev server before `pnpm db:seed` / `pnpm db:migrate`.
  Swapping to a server-backed Postgres is two lines in `db/connection.js`.
- The admin's announcements resource edits data without notifying anyone (data repair);
  the notify fan-out belongs to the publish action only.
