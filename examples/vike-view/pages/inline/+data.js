// The "mix into a normal app" path (Rom's sync question): a HAND-WRITTEN vike-react page that
// renders ONE vike-view block directly, with no page-gen (no viewPages / generic ViewPage). This
// data hook does exactly what a normal app would: resolve the schema, derive the list columns for
// `posts`, and fetch the owner-scoped rows itself. The sibling +Page.jsx imports <ListView> and
// renders it inline among ordinary JSX. Proves a block composes into any page you already own.
import { resolveViewTables, buildDb, viewColumns, tableNamed, crud, column } from 'vike-view'

export async function data(pageContext) {
  const tables = resolveViewTables(pageContext.config)
  const db = buildDb(tables)
  const table = tableNamed(tables, 'posts')

  // `published` uses a SLOT override: its cell renders the app's registered 'published-badge'
  // component (a colored pill) instead of the derived yes/no text. The token rides in the resolved
  // columns; the component is registered client- + server-side by importing PublishedBadge in +Page.jsx.
  const columns = viewColumns(
    crud({ table: 'posts', list: [column('title'), column('published').slot('published-badge'), column('created_at').format('since')] }),
    table,
  )
  const rows = await db.posts.find({ user_id: pageContext.user.id }, { limit: 20 })
  return { columns, rows }
}
