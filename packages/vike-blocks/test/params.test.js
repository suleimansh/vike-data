// Param-token resolution now lives in vike-blocks (params ride on block descriptors — a table row
// action, an action button). vike-actions re-exports it. Covers the $scope.path resolution the
// renderers use to turn a row into concrete params.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveParams, resolveToken } from '../index.js'

test('literals pass through; $scope.path reads the context bucket', () => {
  const ctx = { row: { id: 7, author: { email: 'a@x.com' } } }
  assert.equal(resolveToken('published', ctx), 'published')
  assert.equal(resolveToken(42, ctx), 42)
  assert.equal(resolveToken('$row.id', ctx), 7)
  assert.equal(resolveToken('$row.author.email', ctx), 'a@x.com')
})

test('a bare $scope returns the whole bucket; unknown scope/path -> undefined (no throw)', () => {
  assert.deepEqual(resolveToken('$row', { row: { id: 1 } }), { id: 1 })
  assert.equal(resolveToken('$nope.x', { row: {} }), undefined)
  assert.equal(resolveToken('$row.missing.deep', { row: {} }), undefined)
})

test('resolveParams maps a params object against the row context (the table row-action case)', () => {
  assert.deepEqual(resolveParams({ id: '$row.id', status: 'published' }, { row: { id: 9 } }), { id: 9, status: 'published' })
  assert.deepEqual(resolveParams(undefined), {})
})
