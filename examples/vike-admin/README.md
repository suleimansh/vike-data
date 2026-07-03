# app-vike-admin

The smallest useful [vike-admin](../../packages/vike-admin) app: a working admin panel on
install, on the in-memory adapter (zero database).

The app declares its own tables (`posts`, `tags`) through the schema DSL and contributes three
`adminResources`. `vike-admin/react` then **derives** the `/admin/*` list / create / edit /
delete pages from the composed schema — no ORM code, no CRUD pages. It installs alongside
`vike-auth/react`, because the admin routes are fenced to signed-in users.

## Run

```bash
pnpm --filter app-vike-admin dev     # http://localhost:4320
```

**Sign in** (magic link shown inline in dev — try the seeded `ada@example.com`), then open
**/admin**:

- **Posts** — a curated list + form; `author_id` is a picker of users (FK to vike-auth's
  `users`, labeled by email).
- **Tags** — a **bare** `defineResource({ table: 'tags' })`: every column and field derived
  from the schema.
- **Users** — vike-auth's table, administered too.

Create / edit / delete rows and they persist for the life of the dev server.

## What's where

| File | Role |
|------|------|
| `pages/+config.js` | `extends: [vikeReact, authExt, adminExt]` + the app's `schemas` |
| `pages/blog.schema.js` | app-owned `posts` + `tags` tables (`defineSchema`) |
| `pages/+adminResources.js` | the refined `posts`, bare `tags`, and `users` resources |
| `pages/+onCreateGlobalContext.js` | register the memory adapter + seed rows |
| `pages/index/+Page.jsx` | home / on-ramp |

The `/admin/*` pages and `/login` have **no files here** — they ship with `vike-admin/react`
and `vike-auth/react`.

## Real database

Swap the one line in `+onCreateGlobalContext.js` (`createMemoryAdapter()` → a real
`vike-drizzle`/`registerDrizzle(...)` against a migrated DB); the admin code is unchanged.
