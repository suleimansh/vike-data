// describeBlock / describeBlocks — the programmatic discovery seam ("UI as data"):
// an agent or tool enumerates the catalog and learns how to compose each block
// without reading its source. Pins that manifest contract.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { describeBlock, describeBlocks, listBlocks, getBlock, defineBlock } from '../index.js'
import '../blocks/rating.js' // register a fluent-builder block
import '../core/blocks.js' // register the pass-through built-ins (stat/custom)

test('describeBlock reports a fluent block builder surface (methods + arity)', () => {
  const d = describeBlock('rating')
  assert.equal(d.type, 'rating')
  assert.equal(d.passThrough, true) // rating has no resolve step
  assert.equal(d.builder.arity, 1) // rating(label)
  for (const m of ['value', 'max', 'allowHalf', 'readOnly', 'disabled', 'name']) {
    assert.ok(d.builder.methods.includes(m), `expected builder method ${m}`)
  }
})

test('describeBlock marks a resolve-backed block as not a pass-through', () => {
  // form resolves its descriptor into a view-model (it is registered with a resolve).
  assert.ok(getBlock('form')?.resolve, 'precondition: form has a resolve')
  assert.equal(describeBlock('form').passThrough, false)
})

test('describeBlock returns null for an unknown type', () => {
  assert.equal(describeBlock('does-not-exist'), null)
})

test('a pass-through built-in has no builder metadata', () => {
  const d = describeBlock('stat')
  assert.equal(d.type, 'stat')
  assert.equal(d.builder, null) // registered via registerBlock, no fluent builder
  assert.equal(d.passThrough, true)
})

test('describeBlocks covers the whole registry', () => {
  const all = describeBlocks()
  assert.equal(all.length, listBlocks().length)
  assert.ok(all.every((d) => typeof d.type === 'string'))
  assert.ok(all.some((d) => d.type === 'rating'))
})

test('defineBlock surfaces author-declared params in the manifest', () => {
  defineBlock('test-gauge', {
    build: (value) => ({ value }),
    refine: { max: (n) => ({ max: n }) },
    params: [{ name: 'value', required: true }],
  })
  const d = describeBlock('test-gauge')
  assert.deepEqual(d.params, [{ name: 'value', required: true }])
  assert.deepEqual(d.builder, { methods: ['max'], arity: 1 })
})
