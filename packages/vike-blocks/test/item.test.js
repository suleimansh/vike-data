// The item block: a static list-row leaf (defineBlock) with title / description / media / trailing
// refinements. The renderer is not node:test-tested (JSX/Vue), so this covers the agnostic builder +
// resolve plus the shared row/media/trailing styles.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { item, card, definePage, resolvePage, hasBlock } from '../index.js'
import { itemRowStyle, itemTrailingStyle } from '../blocks/item-styles.js'

test('item is registered', () => {
  assert.ok(hasBlock('item'))
})

test('the builder collapses to a plain descriptor (title optional)', () => {
  assert.deepEqual(item('Billing').build(), { block: 'item', title: 'Billing' })
  assert.deepEqual(item('Billing').description('Manage your plan').media('💳').trailing('Pro').build(), {
    block: 'item',
    title: 'Billing',
    description: 'Manage your plan',
    media: '💳',
    trailing: 'Pro',
  })
  assert.deepEqual(item().build(), { block: 'item' }) // no title
})

test('resolves as a pass-through section', () => {
  const out = resolvePage(definePage({ sections: [item('Sign out').media('↩')] }))
  assert.equal(out.sections[0].block, 'item')
  assert.deepEqual(out.sections[0].resolved, { title: 'Sign out', media: '↩' })
})

test('composes inside a container (a card of items)', () => {
  const out = resolvePage(definePage({ sections: [card([item('One'), item('Two').trailing('2')])] }))
  const sections = out.sections[0].resolved.sections
  assert.deepEqual(sections.map((s) => s.block), ['item', 'item'])
  assert.equal(sections[1].resolved.trailing, '2')
})

test('the row layout is a flex row and the trailing note pushes to the far end', () => {
  assert.equal(itemRowStyle.display, 'flex')
  assert.equal(itemTrailingStyle.marginLeft, 'auto')
})
