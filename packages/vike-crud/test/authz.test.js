// #581 — the authorization primitives (pure). The query read-scope builder mirrors universal-orm's
// narrow filter surface (equality + `{ in }`); `allow` is the can* gate; `keepVisible` drops the
// fields a `.when(ctx)` predicate hides and strips the predicate so the result is serializable.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runQuery, queryScope, allow, keepVisible } from '../index.js'

test('runQuery builds an equality + in filter from the query builder', () => {
  assert.deepEqual(runQuery((q) => q.where('user_id', 'u1'), {}), { user_id: 'u1' })
  assert.deepEqual(runQuery((q) => q.whereIn('status', ['draft', 'live']), {}), { status: { in: ['draft', 'live'] } })
  assert.deepEqual(runQuery((q) => q.where('org', { in: [1, 2] }), {}), { org: { in: [1, 2] } })
  assert.deepEqual(runQuery((q) => q.where('a', 1).where('b', 2), {}), { a: 1, b: 2 })
})

test('runQuery: returning the builder unrefined is unscoped (the admin bypass)', () => {
  const query = (q, ctx) => (ctx.user.role === 'admin' ? q : q.where('user_id', ctx.user.id))
  assert.deepEqual(runQuery(query, { user: { id: 'u1', role: 'admin' } }), {})
  assert.deepEqual(runQuery(query, { user: { id: 'u1', role: 'user' } }), { user_id: 'u1' })
  assert.deepEqual(runQuery(undefined, {}), {}) // no query => unscoped
})

test('runQuery: a brace-body fn that touches the builder but forgets `return q` is still scoped (#691)', () => {
  // The one-character mistake: `{ q.where(...) }` with no return. Must NOT fail open to all rows.
  assert.deepEqual(
    runQuery((q, ctx) => {
      q.where('user_id', ctx.user.id)
    }, { user: { id: 'u1' } }),
    { user_id: 'u1' },
  )
  // An untouched builder with no return stays unscoped (nothing to honor).
  assert.deepEqual(runQuery(() => {}, {}), {})
})

test('queryScope adapts query(q, ctx) into a scope(table, ctx) => filter', () => {
  const scope = queryScope((q, ctx) => q.where('user_id', ctx.user.id))
  assert.equal(typeof scope, 'function')
  assert.deepEqual(scope('posts', { user: { id: 'u9' } }), { user_id: 'u9' })
  assert.equal(queryScope(undefined), undefined)
})

test('allow: missing predicate = allowed; truthy = allowed; sync + async', async () => {
  assert.equal(await allow(undefined, {}), true)
  assert.equal(await allow((ctx) => ctx.user.role === 'admin', { user: { role: 'admin' } }), true)
  assert.equal(await allow((ctx) => ctx.user.role === 'admin', { user: { role: 'user' } }), false)
  assert.equal(await allow(async (rec) => rec.status === 'draft', { status: 'draft' }), true)
  assert.equal(await allow((rec) => rec.status === 'draft', { status: 'live' }), false)
})

test('keepVisible drops hidden fields and strips the when predicate', () => {
  const fields = [{ name: 'title' }, { name: 'secret', when: (ctx) => ctx.user.role === 'admin' }]
  const asUser = keepVisible(fields, { user: { role: 'user' } })
  assert.deepEqual(asUser, [{ name: 'title' }]) // secret dropped, no `when` leaks
  const asAdmin = keepVisible(fields, { user: { role: 'admin' } })
  assert.deepEqual(asAdmin, [{ name: 'title' }, { name: 'secret' }]) // secret kept, `when` stripped
  for (const f of asAdmin) assert.equal(typeof f.when, 'undefined')
})
