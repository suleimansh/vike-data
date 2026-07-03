# app-vike-auth

The smallest useful [vike-auth](../../packages/vike-auth) app: magic-link auth in one install,
on the in-memory adapter (zero database).

Installing `vike-auth/react` brings, from one import:

- the **server session tier** — resolves `pageContext.user` from the session cookie;
- the **`/login` + `/account` pages** (via `config.pages`) — no page file in this app;
- the **`useUser()`** hook.

This app adds only a home page, one **guarded** page, and the memory adapter registration.

## Run

```bash
pnpm --filter app-vike-auth dev     # http://localhost:4310
```

Click **Sign in**, enter any email (or the seeded `ada@example.com`). In dev the magic link is
shown inline — no inbox needed — so following it signs you in. Then visit **/account** and the
**/protected** page; sign out and `/protected` bounces you back to the sign-in form.

## What's where

| File | Role |
|------|------|
| `pages/+config.js` | `extends: [vikeReact, authExt]` + `loginRedirect` |
| `pages/+onCreateGlobalContext.js` | register the memory adapter + seed one user |
| `pages/index/+Page.jsx` | home; reads `useUser()` |
| `pages/protected/+guard.js` | redirect unauthenticated visitors to `/login?next=…` |
| `pages/protected/+Page.jsx` | signed-in-only content |

`/login` and `/account` have **no files here** — they ship with `vike-auth/react`.

## Real database

Swap the one line in `+onCreateGlobalContext.js` (`createMemoryAdapter()` → a real
`vike-drizzle`/`registerDrizzle(...)` against a migrated DB); nothing else changes. To send
real magic-link emails, register a mail transport (e.g. `vike-mail/resend`) — otherwise the dev
console/outbox transport records them and dev mode shows the link inline.
