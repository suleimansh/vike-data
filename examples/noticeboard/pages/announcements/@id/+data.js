// One announcement by route param, with the author joined in. 404s through Vike's render
// helper when the id doesn't exist (a stale notification link, a deleted announcement).
import { getAdapter } from '@universal-orm/core'
import { render } from 'vike/abort'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function data(pageContext) {
  const { id } = pageContext.routeParams
  // The column is a uuid: a malformed param would fail the query itself, not return empty.
  if (!UUID.test(id)) throw render(404, 'No such announcement')
  const adapter = getAdapter()
  const row = (await adapter.find('announcements', { id }))[0]
  if (!row) throw render(404, 'No such announcement')
  const author = row.author_id ? (await adapter.find('users', { id: row.author_id }))[0] : null
  return {
    announcement: {
      id: row.id,
      title: row.title,
      body: row.body,
      author: author?.name || author?.email || 'Unknown',
      created_at: row.created_at,
    },
  }
}
