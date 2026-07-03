// Vike's once-per-server hook — where this demo opts into a universal-orm adapter. vike-auth's
// session store reads/writes through whatever adapter the app registered, so with no real
// database we register the in-process MEMORY adapter (zero DB) and it persists the
// users / sessions / login_tokens rows for the life of the dev server. A real app swaps this
// one line for vike-drizzle + registerDrizzle(...) pointed at a migrated database; nothing
// else changes.
//
// We also seed one user so magic-link login has a named account to reuse: the store looks a
// subject up by email before creating one, so signing in as ada@example.com REUSES this row
// (name included) instead of minting a nameless account. Do NOT carry the fixed-id insert onto
// a real DB — it is safe here only because the MEMORY store starts empty each boot.
import { setAdapter, getAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'

export default async function onCreateGlobalContext() {
  if (getAdapter()) return // idempotent across dev HMR / double-eval
  const adapter = createMemoryAdapter()
  setAdapter(adapter)

  const now = new Date().toISOString()
  adapter.insert('users', { id: 'u-ada', email: 'ada@example.com', name: 'Ada Lovelace', active: true, created_at: now, updated_at: now })
}
