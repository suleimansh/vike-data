// crudActions: register owner-scoped create/update/delete for a table, exercised through runAction
// on the memory adapter (the same setup as data.test.js). Covers ownership forcing, cross-owner
// isolation, patch sanitization, and the missing-pk error.
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { defineSchema } from '@vike-data/vike-schema/schema'
import { setAdapter, clearAdapter } from '@universal-orm/core'
import { createMemoryAdapter } from '@universal-orm/memory'
import { runAction, clearActions, hasAction } from 'vike-actions'
import { resolveViewTables, buildDb, crudActions } from '../index.js'

const posts = defineSchema('posts', (t) => {
  t.uuid('id').primary()
  t.string('title')
  t.boolean('published').default(false)
  t.uuid('user_id') // owner
  t.timestamps()
})
const tables = () => resolveViewTables({ schemas: [posts] })
const scope = (table, ctx) => ({ user_id: ctx.user.id })
const alice = { id: 'u1' }
const bob = { id: 'u2' }

let db
beforeEach(async () => {
  clearActions()
  clearAdapter()
  setAdapter(createMemoryAdapter())
  db = buildDb(tables())
  await db.posts.insert({ id: 'p1', title: 'Alice One', published: false, user_id: 'u1' })
  await db.posts.insert({ id: 'p2', title: 'Bob One', published: false, user_id: 'u2' })
  crudActions({ table: 'posts', tables: tables(), scope })
})

test('registers ${table}.create / update / delete', () => {
  assert.ok(hasAction('posts.create'))
  assert.ok(hasAction('posts.update'))
  assert.ok(hasAction('posts.delete'))
})

test('create inserts an owner-scoped row with a generated pk', async () => {
  const out = await runAction({ name: 'posts.create', input: { title: 'New' }, user: alice })
  assert.equal(out.ok, true)
  assert.equal(out.result.title, 'New')
  assert.equal(out.result.user_id, 'u1') // ownership forced
  assert.ok(out.result.id) // pk filled
  assert.equal((await db.posts.find({ user_id: 'u1' })).length, 2) // p1 + the new one
})

test('create forces ownership + drops unknown keys (client cannot spoof user_id or inject junk)', async () => {
  const out = await runAction({ name: 'posts.create', input: { title: 'X', user_id: 'u2', bogus: 'y' }, user: alice })
  assert.equal(out.result.user_id, 'u1') // not u2
  assert.equal('bogus' in out.result, false) // non-column dropped
})

test('update patches the caller\'s own row', async () => {
  const out = await runAction({ name: 'posts.update', input: { id: 'p1', title: 'Renamed', published: true }, user: alice })
  assert.equal(out.ok, true)
  assert.equal(out.result.title, 'Renamed')
  assert.equal(out.result.published, true)
})

test('update cannot touch another owner\'s row (scope matches nothing)', async () => {
  const out = await runAction({ name: 'posts.update', input: { id: 'p2', title: 'Hacked' }, user: alice })
  assert.equal(out.result, null) // no row matched { id: p2, user_id: u1 }
  assert.equal((await db.posts.findOne({ id: 'p2' })).title, 'Bob One') // unchanged
})

test('update cannot reassign ownership (owner key re-forced onto the patch)', async () => {
  await runAction({ name: 'posts.update', input: { id: 'p1', user_id: 'u2' }, user: alice })
  assert.equal((await db.posts.findOne({ id: 'p1' })).user_id, 'u1') // still Alice's
})

test('update without the pk -> 400', async () => {
  const out = await runAction({ name: 'posts.update', input: { title: 'x' }, user: alice })
  assert.equal(out.ok, false)
  assert.equal(out.status, 400)
})

test('delete removes the caller\'s row and returns it (for the onSuccess toast)', async () => {
  const out = await runAction({ name: 'posts.delete', input: { id: 'p1' }, user: alice })
  assert.equal(out.ok, true)
  assert.equal(out.result.title, 'Alice One')
  assert.equal(await db.posts.findOne({ id: 'p1' }), null)
})

test('delete cannot remove another owner\'s row', async () => {
  const out = await runAction({ name: 'posts.delete', input: { id: 'p2' }, user: alice })
  assert.equal(out.result, null) // nothing matched
  assert.ok(await db.posts.findOne({ id: 'p2' })) // Bob's row survives
})

test('the guard defaults to authed (an anonymous caller is denied)', async () => {
  const out = await runAction({ name: 'posts.delete', input: { id: 'p1' }, user: null })
  assert.equal(out.ok, false)
  assert.equal(out.status, 403)
  assert.ok(await db.posts.findOne({ id: 'p1' })) // not deleted
})
