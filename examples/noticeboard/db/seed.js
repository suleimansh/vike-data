// Tiers 2 + 3 -- reference data and sample rows, idempotent and OFF the request path. This is
// the standalone seed a real app runs as a deploy step (`pnpm db:seed`). Everything here looks
// a row up by a stable key and only inserts what is missing, so re-running changes nothing.
//
//   Tier 2 (reference data): roles + permissions + grants, derived from the declared
//           permission registry by seedRbac (already idempotent).
//   Tier 3 (sample/business rows): three users covering the three roles, plus a welcome
//           announcement so the board has content before anyone posts.
//
// Run while the dev server is stopped (pglite is single-process). `pnpm setup` runs migrate then
// this.
import { registerDrizzle } from 'vike-drizzle'
import { seedRbac, assignRoles } from 'vike-rbac/seed'
import { openDb } from './connection.js'
import { appPermissions, standaloneRoles } from './permissions.js'

const newId = () => globalThis.crypto.randomUUID()
const stamp = () => {
  const at = new Date().toISOString()
  return { created_at: at, updated_at: at }
}

// Find a row by a unique column, else insert it -- the same idempotent primitive seedRbac uses,
// so seeding a business row is safe to re-run and never rewrites an id the FKs depend on.
async function findOrCreate(adapter, table, where, extra = {}) {
  const existing = (await adapter.find(table, where))[0]
  if (existing) return existing
  return adapter.insert(table, { id: newId(), ...where, ...extra, ...stamp() })
}

const { client, db, schema } = await openDb()
const adapter = registerDrizzle(db, schema)

// Tier 2: roles / permissions / grants (idempotent), derived from the shared registry.
await seedRbac(adapter, appPermissions, { roles: standaloneRoles })

// Tier 3: one user per role, keyed by email so a re-seed (or a magic-link sign-in with the same
// address) reuses the row. Ada admin, Erin editor (can post, no user management), Alan member.
const ada = await findOrCreate(adapter, 'users', { email: 'ada@example.com' }, { name: 'Ada Lovelace', active: true })
const erin = await findOrCreate(adapter, 'users', { email: 'erin@example.com' }, { name: 'Erin Editor', active: true })
const alan = await findOrCreate(adapter, 'users', { email: 'alan@example.com' }, { name: 'Alan Turing', active: true })
await assignRoles(adapter, ada.id, ['admin'])
await assignRoles(adapter, erin.id, ['editor'])
await assignRoles(adapter, alan.id, ['member'])

// A first announcement so the board isn't empty. Seeded directly (no notify(): a seed must not
// send); real publishes go through the `announcements.publish` action, which does.
await findOrCreate(
  adapter,
  'announcements',
  { title: 'Welcome to the noticeboard' },
  {
    body: 'This board is the reference app: post an announcement and it fans out to the in-app Bell, email, and web push. Sign in as erin@example.com or ada@example.com to post.',
    author_id: ada.id,
  },
)

await client.close()
console.log('[db:seed] reference data + sample users + welcome announcement seeded (idempotent).')
