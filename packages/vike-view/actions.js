// crudActions — the preset that registers owner-scoped create / update / delete actions for a table
// in one call, so you don't hand-author the three defineActions. The CRUD counterpart to crudBlocks
// (which derives the list/record/form BLOCKS): this derives the WRITE actions, wired to the same
// universal-orm repo and the same owner contract the views use. A domain action (e.g. `publish`)
// stays a hand-written defineAction; this is only the generic C/U/D.
//
//   crudActions({ table: 'posts', tables, scope: (table, ctx) => ({ user_id: ctx.user.id }) })
//   // registers posts.create / posts.update / posts.delete; a table row action points at them:
//   //   button('Delete').action('posts.delete').params({ id: '$row.id' })
//
// `tables` is the merged schema (resolveViewTables(config)); with it the preset knows the primary
// key and the real columns, so it drops unknown/owner/pk keys from a client patch. `scope` is the
// same (table, ctx) -> filter owner contract as defineView; it bounds every write to the caller's
// own rows AND is re-forced onto the written row, so a client can't reassign ownership or touch
// another owner's row. Names are `${table}.${op}`; each returns a serializable ref.
import { defineAction } from 'vike-actions'
import { buildDb, tableNamed } from './resolve.js'

export function crudActions({ table, tables, scope, guard = 'authed', onSuccess = 'reload' } = {}) {
  if (!table || typeof table !== 'string') throw new Error('crudActions: `table` (a string) is required')

  const schemaTable = tables ? tableNamed(tables, table) : null
  const pk = schemaTable?.columns.find((c) => c.primary)?.name ?? 'id'
  const columnNames = schemaTable ? schemaTable.columns.map((c) => c.name) : null

  const repo = () => buildDb(tables)[table]
  const owned = (user) => (scope ? scope(table, { user }) : {})

  // Keep only real schema columns from a client-supplied body, dropping the pk and any owner keys —
  // those are set by the server (pk fill / the scope), never the client. With no `tables` we can't
  // filter to columns, so we only drop the pk (documented: pass `tables` for full sanitization).
  const ownerKeys = (user) => Object.keys(owned(user))
  const sanitize = (input, user) => {
    const skip = new Set([pk, ...ownerKeys(user)])
    const out = {}
    for (const [k, v] of Object.entries(input ?? {})) {
      if (skip.has(k)) continue
      if (columnNames && !columnNames.includes(k)) continue
      out[k] = v
    }
    return out
  }

  const create = defineAction(`${table}.create`, {
    guard,
    onSuccess,
    async run({ input, user }) {
      const row = { ...sanitize(input, user), ...owned(user) }
      if (row[pk] == null) row[pk] = globalThis.crypto.randomUUID()
      await repo().insert(row)
      return repo().findOne({ [pk]: row[pk], ...owned(user) })
    },
  })

  const update = defineAction(`${table}.update`, {
    guard,
    onSuccess,
    async run({ input, user }) {
      const id = input?.[pk]
      if (id == null) {
        const e = new Error(`crudActions: "${pk}" is required to update ${table}`)
        e.status = 400
        throw e
      }
      const filter = { [pk]: id, ...owned(user) } // owner-scoped: matches nothing for another owner
      await repo().update(filter, { ...sanitize(input, user), ...owned(user) }) // re-force ownership
      return repo().findOne(filter)
    },
  })

  const del = defineAction(`${table}.delete`, {
    guard,
    onSuccess,
    async run({ input, user }) {
      const id = input?.[pk]
      if (id == null) {
        const e = new Error(`crudActions: "${pk}" is required to delete ${table}`)
        e.status = 400
        throw e
      }
      const filter = { [pk]: id, ...owned(user) }
      const row = await repo().findOne(filter) // read first so onSuccess can name the deleted row
      await repo().delete(filter)
      return row
    },
  })

  return { create, update, delete: del }
}
