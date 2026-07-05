// describeBlock / describeBlocks — the programmatic discovery seam ("UI as data"):
// an agent or tool enumerates the catalog and learns how to compose each block
// without reading its source. Pins that manifest contract.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { describeBlock, describeBlocks, listBlocks, getBlock, defineBlock, blockCatalog, CATALOG_CONTRACT_VERSION } from '../index.js'
import * as B from '../index.js' // namespace, for evaluating catalog examples against every builder
// Importing ../index.js above registers the whole built-in catalog as a side effect.

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

test('describeBlock surfaces the agent-catalog doc fields', () => {
  const h = describeBlock('heading')
  assert.equal(h.category, 'content')
  assert.equal(typeof h.summary, 'string')
  assert.equal(h.container, false)
  assert.ok(h.example.includes('heading('))
  // a container block is flagged so an agent knows it nests sections
  const dlg = describeBlock('dialog')
  assert.equal(dlg.category, 'overlay')
  assert.equal(dlg.container, true)
})

test('a block without doc metadata still describes with nulls (not missing)', () => {
  defineBlock('test-plain', { build: () => ({}), refine: {} })
  const d = describeBlock('test-plain')
  assert.equal(d.category, null)
  assert.equal(d.summary, null)
  assert.equal(d.container, false)
  assert.equal(d.example, null)
})

test('defineBlock records inline doc metadata', () => {
  defineBlock('test-widget', { build: (v) => ({ v }), refine: {}, category: 'data', summary: 'A test widget.', example: 'widget(1)' })
  const d = describeBlock('test-widget')
  assert.equal(d.category, 'data')
  assert.equal(d.summary, 'A test widget.')
  assert.equal(d.example, 'widget(1)')
})

test('every catalog example is valid: it builds to a real descriptor', () => {
  // An agent copies `example` verbatim, so a wrong builder method there is a real bug.
  // Eval each builder-form example against the actual builders and assert it collapses
  // to a { block, ... } descriptor (or an array of them). Descriptor-form examples
  // (starting with `{`) are literal and skipped.
  const scope = Object.keys(B)
  const vals = scope.map((k) => B[k])
  for (const b of B.blockCatalog().blocks) {
    if (b.type.startsWith('test-')) continue // skip fixtures registered by other tests in this file
    if (!b.example || b.example.trim().startsWith('{')) continue
    const fn = new Function(...scope, `const _e = (${b.example}); return _e && typeof _e.build === 'function' ? _e.build() : _e;`)
    let out
    assert.doesNotThrow(() => (out = fn(...vals)), `example for '${b.type}' threw: ${b.example}`)
    assert.ok(out && (out.block !== undefined || Array.isArray(out)), `example for '${b.type}' did not build a descriptor`)
  }
})

test('blockCatalog is a versioned, serializable snapshot of the whole catalog', () => {
  const cat = blockCatalog()
  assert.equal(cat.contractVersion, CATALOG_CONTRACT_VERSION)
  assert.equal(cat.blocks.length, listBlocks().length)
  // an agent embeds this in a prompt / MCP response, so it must survive a JSON round-trip
  const round = JSON.parse(JSON.stringify(cat))
  assert.equal(round.contractVersion, CATALOG_CONTRACT_VERSION)
  assert.ok(round.blocks.some((b) => b.type === 'dialog' && b.container === true))
})
