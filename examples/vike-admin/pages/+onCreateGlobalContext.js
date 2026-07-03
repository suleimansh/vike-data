// Vike's once-per-server hook — where this demo opts into a universal-orm adapter. vike-admin
// reads/writes every table through whatever adapter the app registered, so with no real
// database we register the in-process MEMORY adapter (zero DB) and it persists the rows for the
// life of the dev server. A real app swaps this one line for vike-drizzle + registerDrizzle(...)
// against a migrated database; the admin code does not change.
//
// We seed a user to sign in as (admin is auth-gated) plus a few posts/tags so the panel has
// content on first load. Do NOT carry the raw fixed-id inserts onto a real DB — they are safe
// only because the MEMORY store starts empty each boot; there, rows come from an idempotent
// seed step (see examples/drizzle-pglite).
import { setAdapter, getAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

export default async function onCreateGlobalContext() {
  if (getAdapter()) return // idempotent across dev HMR / double-eval
  const adapter = createMemoryAdapter()
  setAdapter(adapter)

  // The user you sign in as (magic-link login reuses this row by email, name included).
  adapter.insert('users', { id: 'u-ada', email: 'ada@example.com', name: 'Ada Lovelace', active: true, created_at: daysAgo(40), updated_at: daysAgo(2) })

  // Posts (author_id FKs into users) + tags, so /admin/posts and /admin/tags have rows.
  adapter.insert('posts', { id: 'p-1', title: 'Hello, vike-admin', body: 'A panel derived from the schema.', published: true, author_id: 'u-ada', created_at: daysAgo(5), updated_at: daysAgo(5) })
  adapter.insert('posts', { id: 'p-2', title: 'Draft: composed schemas', body: 'Still writing this one.', published: false, author_id: 'u-ada', created_at: daysAgo(1), updated_at: daysAgo(1) })
  adapter.insert('tags', { id: 't-1', name: 'Announcements', slug: 'announcements', created_at: daysAgo(20), updated_at: daysAgo(20) })
  adapter.insert('tags', { id: 't-2', name: 'Guides', slug: 'guides', created_at: daysAgo(20), updated_at: daysAgo(20) })
}
