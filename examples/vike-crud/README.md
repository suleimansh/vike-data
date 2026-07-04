# vike-crud example

The smallest possible schema-driven app. One `defineSchema('posts')` becomes a full CRUD resource, with no page components, forms, or controllers written by hand.

## What it shows

- **A resource in one call** (`/posts`): `defineCrud('posts', { ... })` declares the `posts` table as a CRUD resource and derives the pages it needs -- index / view / create / edit. `viewPages(views)` turns each derived route into a real Vike page (one generic page + one generic data hook), so no page code exists for these routes. GET renders the schema-derived list; POST writes a row through the owner-scoped data hook and redirects back.
- **Presentation modes**: `mode` picks how the view / create / edit screens appear, and each screen can override it.
  - `dialog` (default, `/posts`): a list, with view / create / edit opening as URL-synced dialogs over it (`?view=<id>`, `?create`, `?edit=<id>`). The list is the whole page until a dialog is triggered -- nothing empty stacks on the index.
  - `route` (`/posts-route`): separate pages at `/posts-route`, `/posts-route/@id` (view), `/posts-route/new` (create), `/posts-route/@id/edit`. The list links each row to its own detail page.
  - `inline`: the screens stack in place on the index page (list + a create form under it).
- **Refine with builders**: `index: [column('title').sortable()]`, `view: [display('title')]`, `edit: [field('title').required()]` pick / rename / order columns per screen; a screen set to `false` is dropped, and absent screens derive every field from the schema.
- **Owner scoping**: `query: (q, ctx) => q.where('user_id', ctx.user.id)` bounds every read to the current user's rows, and `onCreate: (ctx) => ({ user_id: ctx.user.id })` stamps the owner onto every insert. The demo identity comes from `+onCreatePageContext.js` (a real app installs vike-auth instead).
- **Eject** (`/posts-ejected`): `ejectView(view)` writes a single generated page out to plain, owned source (data hook + view descriptor + owner-scope) under `pages/posts-ejected/`; nothing regenerates. `ejectCrud(pages)` is the resource-level twin -- it reveals the explicit `definePage[]` a `defineCrud` expands to (built from `crud.index/view/create/edit`), so you own and edit the pages while they still render identically.
- **Mix into a normal app** (`/inline`): a hand-written vike-react page that imports vike-crud's `<ListView>` block and renders it directly, no page-gen. Proves the blocks compose into pages you already own; they are not lock-in.
- **Owner-guarded actions in a table** (`/actions-demo`): the user's posts as a `table` block with a **row-action column** -- per row, `button('Publish').action('publish').params({ id: '$row.id' })` and a Delete button. The table renderer resolves `$row.id` against each row; the click POSTs `/_actions/<name>`. `publish` is a hand-written domain action; `posts.delete` comes from the `crudActions({ table, tables, scope })` preset (owner-scoped create/update/delete in one call). Both are guarded (`'authed'`) and enforce ownership in their write filter; `publish` returns an `onSuccess` toast naming the post. `+Wrapper.jsx` mounts `<ActionsProvider>` + `<Toaster>`, so the click fires the toast and reloads. Wired with `vike-actions`; the endpoint is one middleware pointed at `pages/actions.js`.

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
  +views.js                defineCrud('posts', { ... }) -- the resource: index/view/create/edit
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
