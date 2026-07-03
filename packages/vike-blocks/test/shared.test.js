// The shared builder helpers in blocks/_shared.js, exercised directly (they are also covered
// transitively by the per-block tests, but this pins the shared contract in one place).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeOption,
  resolveOptions,
  clamp,
  keyResolver,
  aliasedKeyResolver,
  normalizeQuery,
  initials,
  normalizeSide,
  normalizeAlign,
} from '../blocks/_shared.js'

test('normalizeOption: label defaults to value; disabled only when opted in', () => {
  assert.deepEqual(normalizeOption({ value: 'a' }), { value: 'a', label: 'a' })
  assert.deepEqual(normalizeOption({ value: 'a', label: 'A' }), { value: 'a', label: 'A' })
  assert.deepEqual(normalizeOption({ value: 'a', disabled: true }), { value: 'a', label: 'a' })
  assert.deepEqual(normalizeOption({ value: 'a', disabled: true }, { withDisabled: true }), { value: 'a', label: 'a', disabled: true })
})

test('resolveOptions maps a (possibly nullish) list', () => {
  assert.deepEqual(resolveOptions(undefined), [])
  assert.deepEqual(resolveOptions([{ value: 'x' }]), [{ value: 'x', label: 'x' }])
})

test('clamp bounds n into [lo, hi]', () => {
  assert.equal(clamp(5, 0, 10), 5)
  assert.equal(clamp(-1, 0, 10), 0)
  assert.equal(clamp(11, 0, 10), 10)
})

test('keyResolver keeps a known key, else the default', () => {
  const r = keyResolver({ a: 1, b: 2 }, 'a')
  assert.equal(r('b'), 'b')
  assert.equal(r('zzz'), 'a')
})

test('aliasedKeyResolver folds aliases before the guard', () => {
  const r = aliasedKeyResolver({ warn: 'warning' }, { warning: 1, info: 1 }, 'info')
  assert.equal(r('warn'), 'warning')
  assert.equal(r('warning'), 'warning')
  assert.equal(r('nope'), 'info')
})

test('normalizeQuery coerces, trims, lowercases', () => {
  assert.equal(normalizeQuery('  Foo '), 'foo')
  assert.equal(normalizeQuery(null), '')
})

test('initials: first+last, mononym, empty', () => {
  assert.equal(initials('Ada Lovelace'), 'AL')
  assert.equal(initials('Grace Brewster Hopper'), 'GH')
  assert.equal(initials('Cher'), 'C')
  assert.equal(initials('  '), '')
  assert.equal(initials(null), '')
})

test('normalizeSide / normalizeAlign coerce to legal values', () => {
  assert.equal(normalizeSide('left', ['top', 'bottom', 'left', 'right'], 'top'), 'left')
  assert.equal(normalizeSide('nope', ['top', 'bottom'], 'bottom'), 'bottom')
  assert.equal(normalizeAlign('end'), 'end')
  assert.equal(normalizeAlign('whatever'), 'start')
})
