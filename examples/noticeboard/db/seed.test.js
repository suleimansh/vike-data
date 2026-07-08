// CI smoke test for the real-DB path this app demonstrates. Runs against an in-memory
// pglite (no dataDir -> no disk, no lock), applies the committed migrations, registers the
// Drizzle adapter, and seeds -- the same chain pnpm setup runs, minus persistence. It guards:
//   1. migrations + schema + adapter compose (auth + rbac + push + notifications +
//      announcements tables all exist and take rows),
//   2. seeding is idempotent (re-running does not duplicate rows),
//   3. UTC timestamps round-trip faithfully -- the regression that made a fresh magic-link token
//      read as already expired before timestamptz (see universal-schema compilers.js).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { registerDrizzle } from 'vike-drizzle'
import { seedRbac, assignRoles } from 'vike-rbac/seed'
import { schema, MIGRATIONS_DIR } from './connection.js'
import { appPermissions, standaloneRoles } from './permissions.js'

const newId = () => globalThis.crypto.randomUUID()
const stamp = () => {
  const at = new Date().toISOString()
  return { created_at: at, updated_at: at }
}
async function findOrCreate(adapter, table, where, extra = {}) {
  const existing = (await adapter.find(table, where))[0]
  if (existing) return existing
  return adapter.insert(table, { id: newId(), ...where, ...extra, ...stamp() })
}

// Mirrors db/seed.js: one user per role + the welcome announcement.
async function seed(adapter) {
  await seedRbac(adapter, appPermissions, { roles: standaloneRoles })
  const ada = await findOrCreate(adapter, 'users', { email: 'ada@example.com' }, { name: 'Ada Lovelace', active: true })
  const erin = await findOrCreate(adapter, 'users', { email: 'erin@example.com' }, { name: 'Erin Editor', active: true })
  const alan = await findOrCreate(adapter, 'users', { email: 'alan@example.com' }, { name: 'Alan Turing', active: true })
  await assignRoles(adapter, ada.id, ['admin'])
  await assignRoles(adapter, erin.id, ['editor'])
  await assignRoles(adapter, alan.id, ['member'])
  await findOrCreate(adapter, 'announcements', { title: 'Welcome to the noticeboard' }, { body: 'Hello', author_id: ada.id })
}

test('migrate + seed compose on Postgres, idempotently, with faithful timestamps', async () => {
  const client = new PGlite()
  await client.waitReady
  const db = drizzle(client)
  await migrate(db, { migrationsFolder: MIGRATIONS_DIR })
  const adapter = registerDrizzle(db, schema, { override: true })

  // Seed twice -- idempotent: counts must not double.
  await seed(adapter)
  await seed(adapter)

  assert.equal((await adapter.find('users', {})).length, 3, 'exactly three users after re-seed')
  assert.equal((await adapter.find('roles', {})).length, 3, 'admin + editor + member roles')
  assert.equal((await adapter.find('permissions', {})).length, 3, 'users.view + users.edit + announcements.post')
  assert.equal((await adapter.find('announcements', {})).length, 1, 'one welcome announcement after re-seed')

  // Ada is the admin, and the announcement FK points at her.
  const ada = (await adapter.find('users', { email: 'ada@example.com' }))[0]
  const adaRoles = await adapter.find('role_user', { user_id: ada.id })
  assert.equal(adaRoles.length, 1, 'ada has one role assignment')
  const welcome = (await adapter.find('announcements', {}))[0]
  assert.equal(welcome.author_id, ada.id, 'welcome announcement is authored by ada')

  // The delivery tables composed in: a notification row (the database channel's write shape)
  // and a push subscription row both insert cleanly.
  await adapter.insert('notifications', {
    id: newId(),
    user_id: ada.id,
    type: 'announcement_published',
    data: JSON.stringify({ title: welcome.title }),
    read_at: null,
    ...stamp(),
  })
  assert.equal((await adapter.find('notifications', { user_id: ada.id })).length, 1, 'notifications table takes rows')

  // The regression guard: a UTC instant written now must read back as the SAME instant,
  // not shifted by the server's local offset. Before timestamptz this drifted by the offset.
  const written = new Date().toISOString()
  await adapter.insert('login_tokens', {
    id: newId(),
    email: 'tz@example.com',
    token: 'tz-roundtrip',
    expires_at: written,
    consumed_at: null,
    ...stamp(),
  })
  const back = (await adapter.find('login_tokens', { token: 'tz-roundtrip' }))[0]
  const drift = Math.abs(new Date(back.expires_at).getTime() - new Date(written).getTime())
  assert.ok(drift < 1000, `timestamp round-trips within 1s (drift was ${drift}ms)`)

  await client.close()
})
