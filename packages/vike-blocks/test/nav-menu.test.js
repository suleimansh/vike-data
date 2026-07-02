// The nav-menu block: a navigation bar of top-level links + dropdown sections (registerBlock, type
// 'nav-menu', accumulating builder `navMenu`). The renderers are not node:test-tested (JSX/Vue stateful
// + DOM-only popover + roving focus, reused from the dropdown), so this covers the agnostic builder +
// resolve, including the group-link normalization (object and tuple forms).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { navMenu, definePage, resolvePage, hasBlock } from '../index.js'

test('nav-menu is registered', () => {
  assert.ok(hasBlock('nav-menu'))
})

test('the builder accumulates links and groups in bar order', () => {
  const built = navMenu().link('Home', '/').group('Products', [{ label: 'Analytics', to: '/a', description: 'Track it' }]).link('Docs', '/docs').build()
  assert.equal(built.block, 'nav-menu')
  assert.equal(built.items.length, 3)
  assert.deepEqual(built.items[0], { type: 'link', label: 'Home', to: '/' })
  assert.equal(built.items[1].type, 'group')
  assert.equal(built.items[1].label, 'Products')
  assert.deepEqual(built.items[1].links[0], { label: 'Analytics', to: '/a', description: 'Track it' })
  assert.deepEqual(built.items[2], { type: 'link', label: 'Docs', to: '/docs' })
})

test('group links normalize from tuples and objects; description is optional', () => {
  const built = navMenu()
    .group('More', [
      ['Billing', '/billing', 'Plans and invoices'],
      ['Team', '/team'],
      { label: 'Settings', to: '/settings' },
    ])
    .build()
  assert.deepEqual(built.items[0].links, [
    { label: 'Billing', to: '/billing', description: 'Plans and invoices' },
    { label: 'Team', to: '/team' },
    { label: 'Settings', to: '/settings' },
  ])
})

test('a bare link (no to) and an empty group are allowed', () => {
  const built = navMenu().link('Static').group('Empty').build()
  assert.deepEqual(built.items[0], { type: 'link', label: 'Static' })
  assert.deepEqual(built.items[1], { type: 'group', label: 'Empty', links: [] })
})

test('resolves as a pass-through of the bar items (deep-copied)', () => {
  const out = resolvePage(definePage({ sections: [navMenu().link('Home', '/').group('P', [['A', '/a']])] }))
  assert.equal(out.sections[0].block, 'nav-menu')
  assert.equal(out.sections[0].resolved.items.length, 2)
  assert.equal(out.sections[0].resolved.items[1].links[0].to, '/a')
})
