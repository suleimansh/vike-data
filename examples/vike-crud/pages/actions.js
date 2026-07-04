// The app's server actions + the endpoint that runs them, co-located so importing this module (the
// middleware pointer in +config.js) both REGISTERS the actions and installs the handler at server
// start. A real app would instead `extends: ['import:vike-actions/config:default']` (whose default
// endpoint resolves the vike-auth session) and import its action modules for their side-effect; here
// we hand-build the handler only to inject the same fixed demo identity as +onCreatePageContext.js,
// since this example carries no auth.
import { defineAction, createActionsHandler } from 'vike-actions'
import { buildDb, resolveViewTables, crudActions } from 'vike-crud'
import { postsSchema } from './posts.schema.js'

// The same demo identity +onCreatePageContext.js puts on pageContext.user. A real app deletes this
// and lets vike-actions' default endpoint resolve the signed-in user from the session cookie.
const demoUser = { id: 'u_demo', email: 'demo@example.com', name: 'Demo User' }

// The merged schema -> a universal-orm repo on the SAME cached memory adapter the views read/write
// through, so a publish is immediately visible to the /posts list.
const tables = resolveViewTables({ schemas: [postsSchema] })

// The owner-guarded publish action. `guard: 'authed'` requires a signed-in user; ownership is then
// enforced in the write filter ({ id, user_id }) exactly like the view's scoped write path, so a
// guessed id for someone else's post matches nothing. onSuccess is a function so the toast can name
// the post it just published; only the resolved hint crosses to the client.
defineAction('publish', {
  input: { id: 'string' },
  guard: 'authed',
  async run({ input, user }) {
    const db = buildDb(tables)
    const owned = { id: input.id, user_id: user.id }
    await db.posts.update(owned, { published: true })
    return db.posts.findOne(owned)
  },
  onSuccess: (post) => ({ toast: post ? `Published "${post.title}"` : 'Published', reload: true }),
})

// Generic create/update/delete for posts, owner-scoped, in ONE call — the crudActions preset (vs the
// hand-written `publish` domain action above). Registers posts.create / posts.update / posts.delete;
// the table demo points its Delete button at `posts.delete`. The scope is the same owner contract as
// +views.js. A result-naming toast is left to the default 'reload'; override per action if wanted.
crudActions({ table: 'posts', tables, scope: (table, ctx) => ({ user_id: ctx.user.id }) })

// Seed a few demo posts on first load so /posts shows content instead of an empty table (the memory
// adapter starts empty and resets on restart). Idempotent: only seeds when the demo user owns none,
// so an HMR re-run won't duplicate. Owner column + timestamps are set explicitly (the memory adapter
// stores rows verbatim); the varied status / published / created_at make the list + `since` column
// read realistically. Top-level await keeps the seed done before the first request lands.
const seedDb = buildDb(tables)
if ((await seedDb.posts.count({ user_id: demoUser.id })) === 0) {
  const day = 86400000
  const at = (n) => new Date(Date.now() - n * day).toISOString()
  const seed = [
    { title: 'Shipping the schema-driven CRUD demo', body: 'One defineSchema, zero bespoke UI.', status: 'scheduled', published: true, days: 1 },
    { title: 'How owner-scoping works', body: 'Every read and write is bounded to the signed-in user.', status: 'in-review', published: false, days: 4 },
    { title: 'Blocks are composable, not lock-in', body: 'Rearrange the generated list / record / form freely.', status: 'draft', published: false, days: 12 },
    { title: 'Ejecting a generated view', body: 'Write the page out to owned source when you outgrow the defaults.', status: 'draft', published: true, days: 45 },
  ]
  for (const p of seed) {
    await seedDb.posts.insert({
      id: globalThis.crypto.randomUUID(),
      title: p.title,
      body: p.body,
      status: p.status,
      published: p.published,
      user_id: demoUser.id,
      created_at: at(p.days),
      updated_at: at(p.days),
    })
  }
}

export default createActionsHandler({ resolveUser: async () => demoUser })
