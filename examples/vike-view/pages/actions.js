// The app's server actions + the endpoint that runs them, co-located so importing this module (the
// middleware pointer in +config.js) both REGISTERS the actions and installs the handler at server
// start. A real app would instead `extends: ['import:vike-actions/config:default']` (whose default
// endpoint resolves the vike-auth session) and import its action modules for their side-effect; here
// we hand-build the handler only to inject the same fixed demo identity as +onCreatePageContext.js,
// since this example carries no auth.
import { defineAction, createActionsHandler } from 'vike-actions'
import { buildDb, resolveViewTables } from 'vike-view/resolve'
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

export default createActionsHandler({ resolveUser: async () => demoUser })
