// Server-only data for the board: every announcement, newest first, with the author's name
// joined in (two adapter reads, no N+1: one find over announcements, one over the referenced
// users). data() touches the adapter so it runs server-side; the page reads it with useData.
import { getAdapter } from '@universal-orm/core'

export async function data() {
  const adapter = getAdapter()
  const rows = await adapter.find('announcements', {}, { orderBy: { column: 'created_at', dir: 'desc' } })
  const authorIds = [...new Set(rows.map((r) => r.author_id).filter(Boolean))]
  const authors = new Map()
  for (const id of authorIds) {
    const u = (await adapter.find('users', { id }))[0]
    if (u) authors.set(id, u.name || u.email)
  }
  return {
    announcements: rows.map((r) => ({
      id: r.id,
      title: r.title,
      body: r.body,
      author: authors.get(r.author_id) || 'Unknown',
      created_at: r.created_at,
    })),
  }
}
