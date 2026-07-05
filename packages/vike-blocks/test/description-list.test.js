// The description-list block: a fluent builder for a key-value metadata grid whose values are strings or
// nested blocks (resolved recursively), with columns / bordered / title settings and per-item span.
// Renderers (react/vue) are DOM-only markup and are not node:test-tested; this covers builder + resolve.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { descriptionList, badge, text, definePage, resolvePage, hasBlock } from '../index.js'

test('description-list is registered', () => {
  assert.ok(hasBlock('description-list'))
})

test('the builder accumulates items; a string value passes through, a nested-block value collapses', () => {
  const desc = descriptionList()
    .title('Order #1024')
    .item('Customer', 'Ada Lovelace')
    .item('Status', [badge('Paid').tone('success')])
    .columns(3)
    .bordered()
    .build()
  assert.equal(desc.block, 'description-list')
  assert.equal(desc.title, 'Order #1024')
  assert.equal(desc.columns, 3)
  assert.equal(desc.bordered, true)
  assert.deepEqual(desc.items[0], { term: 'Customer', value: 'Ada Lovelace' })
  // a nested-block value is collapsed to plain descriptors
  assert.deepEqual(desc.items[1], { term: 'Status', value: [{ block: 'badge', value: 'Paid', tone: 'success' }] })
})

test('columns defaults to 2 and clamps to at least 1; bordered/title are omitted when unset', () => {
  const d = descriptionList().item('A', 'x').build()
  assert.equal(d.columns, 2)
  assert.equal('bordered' in d, false)
  assert.equal('title' in d, false)
  assert.equal(descriptionList().columns(0).build().columns, 1)
})

test('a span is carried on the descriptor', () => {
  const [it] = descriptionList().item('Addr', 'long', { span: 2 }).build().items
  assert.deepEqual(it, { term: 'Addr', value: 'long', span: 2 })
})

test('resolve passes a string value through and flags it non-block; span defaults to 1', () => {
  const r = resolvePage(definePage({ sections: [descriptionList().item('Owner', 'Ada')] })).sections[0].resolved
  assert.equal(r.columns, 2)
  assert.equal(r.bordered, false)
  assert.deepEqual(r.items[0], { term: 'Owner', blocks: false, value: 'Ada', span: 1 })
})

test('resolve turns a nested-block value into resolved view-models and flags it', () => {
  const item = resolvePage(definePage({ sections: [descriptionList().item('Tags', [text('urgent')])] })).sections[0].resolved.items[0]
  assert.equal(item.blocks, true)
  assert.equal(item.value[0].block, 'text')
  assert.deepEqual(item.value[0].resolved, { value: 'urgent' })
})

test('resolve clamps a span to the column count', () => {
  const r = resolvePage(definePage({ sections: [descriptionList().columns(2).item('Wide', 'x', { span: 9 })] })).sections[0].resolved
  assert.equal(r.items[0].span, 2)
})
