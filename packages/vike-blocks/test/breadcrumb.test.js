// The breadcrumb block: a dep-free, theme-native page trail built with a fluent accumulating builder
// (breadcrumb().crumb('Home','/').crumb('Edit')). The renderer is not node:test-tested (JSX/Vue), so
// this covers the agnostic builder + resolve (crumb list, the optional link `to`, custom separator).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { breadcrumb, definePage, resolvePage, hasBlock } from '../index.js'

test('breadcrumb is registered', () => {
  assert.ok(hasBlock('breadcrumb'))
})

test('the builder accumulates crumbs and collapses to a descriptor', () => {
  assert.deepEqual(breadcrumb().crumb('Home', '/').crumb('Posts', '/posts').crumb('Edit').build(), {
    block: 'breadcrumb',
    items: [
      { label: 'Home', to: '/' },
      { label: 'Posts', to: '/posts' },
      { label: 'Edit' },
    ],
  })
})

test('a custom separator flows through', () => {
  assert.deepEqual(breadcrumb().crumb('a', '/a').crumb('b').separator('/').build(), {
    block: 'breadcrumb',
    items: [{ label: 'a', to: '/a' }, { label: 'b' }],
    separator: '/',
  })
})

test('resolve passes the crumbs through; separator defaults to null (renderer draws a chevron)', () => {
  const out = resolvePage(definePage({ sections: [breadcrumb().crumb('Home', '/').crumb('Users', '/admin/users').crumb('Ada')] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'breadcrumb')
  assert.equal(r.items.length, 3)
  assert.deepEqual(r.items[0], { label: 'Home', to: '/' })
  assert.deepEqual(r.items[2], { label: 'Ada' }) // last crumb: no link (the renderer marks it current)
  assert.equal(r.separator, null)
})

test('an empty breadcrumb resolves to an empty list (no crash)', () => {
  const out = resolvePage(definePage({ sections: [breadcrumb()] }))
  assert.deepEqual(out.sections[0].resolved.items, [])
})
