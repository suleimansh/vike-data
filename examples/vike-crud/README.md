# vike-crud example

The smallest possible schema-driven app. One `defineSchema('posts')` becomes a full CRUD page, with no page components, forms, or controllers written by hand.

## What it shows

- **Page generation** (`/posts`): `viewPages(views)` turns a `definePage({ route, sections: crudBlocks({ table: 'posts' }) })` into a real Vike page. GET renders the list + create form derived from the schema; POST writes a row through the owner-scoped data hook and redirects back, so the new row shows on reload. No page code exists for this route.
- **Mix into a normal app** (`/inline`): a hand-written vike-react page that imports vike-crud's `<ListView>` block and renders it directly, no page-gen. Proves the blocks compose into pages you already own; they are not lock-in.
- **Owner scoping**: the view's `scope: (table, ctx) => ({ user_id: ctx.user.id })` bounds every read and forces `user_id` onto every write. The demo identity comes from `+onCreatePageContext.js` (a real app installs vike-auth instead).
- **Owner-guarded actions in a table** (`/actions-demo`): the user's posts as a `table` block with a **row-action column** — per row, `button('Publish').action('publish').params({ id: '$row.id' })` and a Delete button. The table renderer resolves `$row.id` against each row; the click POSTs `/_actions/<name>`. `publish` is a hand-written domain action; `posts.delete` comes from the `crudActions({ table, tables, scope })` preset (owner-scoped create/update/delete in one call). Both are guarded (`'authed'`) and enforce ownership in their write filter; `publish` returns an `onSuccess` toast naming the post. `+Wrapper.jsx` mounts `<ActionsProvider>` + `<Toaster>`, so the click fires the toast and reloads. Wired with `vike-actions`; the endpoint is one middleware pointed at `pages/actions.js`.

## Run

From the repo root:

```bash
pnpm install
pnpm --filter app-vike-crud dev
```

Open http://localhost:4200. The store is the in-memory adapter (cached on `globalThis`, so writes persist across requests within a dev run). Drop in a real database exactly like `examples/drizzle-pglite` -- only `+onCreateGlobalContext.js` changes; the app config does not.

## The whole app

```
pages/
  posts.schema.js          one defineSchema('posts')  -- the intent
  +views.js                definePage({ route: '/posts', sections: crudBlocks({ table: 'posts' }) })
  +config.js               extends vike-react + vike-crud; schemas + pages; middleware -> actions.js
  +onCreatePageContext.js  a demo user (owner-scoping needs one)
  +Wrapper.jsx             mounts <ActionsProvider> + <Toaster> around every page
  actions.js               defineAction('publish', ...) + the actions endpoint (demo user)
  index/+Page.jsx          the links
  inline/+Page.jsx         the mix-in path: <ListView> in a hand-written page
  inline/+data.js          resolves columns + fetches owner-scoped rows
  actions-demo/+Page.jsx   posts + a Publish action button, drawn as blocks
  actions-demo/+data.js    the user's posts (seeds a couple of drafts on first load)
```
