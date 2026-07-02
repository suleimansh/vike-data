// The demo page's data: the signed-in user's posts (owner-scoped), seeding a couple of drafts the
// first time so there is always something to publish. Server-only (a +data hook), so it touches the
// same cached memory adapter the views and the publish action use.
import { buildDb, resolveViewTables } from 'vike-view/resolve'
import { postsSchema } from '../posts.schema.js'

const tables = resolveViewTables({ schemas: [postsSchema] })

const draft = (user, title) => ({ id: globalThis.crypto.randomUUID(), title, body: '...', published: false, user_id: user.id })

export default async function data(pageContext) {
  const db = buildDb(tables)
  const owned = { user_id: pageContext.user.id }

  let posts = await db.posts.find(owned)
  if (posts.length === 0) {
    await db.posts.insert(draft(pageContext.user, 'Draft: Hello world'))
    await db.posts.insert(draft(pageContext.user, 'Draft: Notes on vike-actions'))
    posts = await db.posts.find(owned)
  }

  // Plain + serializable — only what the page renders.
  return { posts: posts.map((p) => ({ id: p.id, title: p.title, published: !!p.published })) }
}
