import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolveParams, resolveToken } from '../index.js'

test('literals pass through; $scope.path reads the context bucket', () => {
  const ctx = { row: { id: 7, author: { email: 'a@x.com' } }, record: { slug: 'hi' } }
  assert.equal(resolveToken('published', ctx), 'published')
  assert.equal(resolveToken(42, ctx), 42)
  assert.equal(resolveToken('$row.id', ctx), 7)
  assert.equal(resolveToken('$row.author.email', ctx), 'a@x.com')
  assert.equal(resolveToken('$record.slug', ctx), 'hi')
})

test('a bare $scope returns the whole bucket', () => {
  assert.deepEqual(resolveToken('$row', { row: { id: 1 } }), { id: 1 })
})

test('unknown scope or missing path -> undefined (never a throw)', () => {
  assert.equal(resolveToken('$nope.x', { row: {} }), undefined)
  assert.equal(resolveToken('$row.missing.deep', { row: {} }), undefined)
})

test('resolveParams maps every value against the context', () => {
  const out = resolveParams({ id: '$row.id', status: 'published', n: 3 }, { row: { id: 9 } })
  assert.deepEqual(out, { id: 9, status: 'published', n: 3 })
})

test('no/blank params -> empty object', () => {
  assert.deepEqual(resolveParams(undefined), {})
  assert.deepEqual(resolveParams(null, { row: {} }), {})
})
