// The tree-view block: a fluent + data-driven builder for a nested collapsible hierarchy, resolved
// recursively with active/relevant + auto-open seeding. Renderers (react/vue) are not node:test-tested
// (JSX/Vue); this covers the agnostic authoring + resolve + the samePath matcher.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tree, definePage, resolvePage, hasBlock } from '../index.js'
import { samePath, resolveTree } from '../blocks/tree-view-styles.js'

test('tree-view is registered', () => {
  assert.ok(hasBlock('tree-view'))
})

test('the builder collapses to a descriptor; nodes normalize and children recurse', () => {
  const desc = tree()
    .current('/src/a.js')
    .node('src', { open: true }, [{ label: 'a.js', href: '/src/a.js' }, ['utils', [{ label: 'b.js', href: '/src/utils/b.js' }]]])
    .node('README', { href: '/readme' })
    .build()
  assert.equal(desc.block, 'tree-view')
  assert.equal(desc.current, '/src/a.js')
  assert.equal(desc.collapsible, true)
  const [src, readme] = desc.items
  assert.equal(src.label, 'src')
  assert.equal(src.open, true)
  assert.equal(src.children.length, 2)
  // a [label, childrenArray] tuple becomes a branch
  assert.deepEqual(src.children[1], { label: 'utils', children: [{ label: 'b.js', href: '/src/utils/b.js' }] })
  assert.deepEqual(readme, { label: 'README', href: '/readme' })
})

test('the initial-array form is equivalent to fluent .node()', () => {
  const desc = tree([{ label: 'x', href: '/x' }]).build()
  assert.deepEqual(desc.items, [{ label: 'x', href: '/x' }])
})

test('.collapsible(false) flips the flag', () => {
  assert.equal(tree().collapsible(false).build().collapsible, false)
})

test('unknown keys are dropped; disabled/selected/icon/badge survive', () => {
  const [n] = tree().node('f', { href: '/f', icon: '📁', badge: '3', disabled: true, bogus: 1 }).build().items
  assert.deepEqual(n, { label: 'f', href: '/f', icon: '📁', badge: '3', disabled: true })
})

test('resolve marks the active leaf and auto-opens the branch that holds it', () => {
  const out = resolvePage(definePage({ sections: [tree().current('/src/utils/b.js').node('src', {}, [['utils', [{ label: 'b.js', href: '/src/utils/b.js' }]]])] }))
  const r = out.sections[0].resolved
  const src = r.items[0]
  assert.equal(src.hasChildren, true)
  assert.equal(src.relevant, true) // holds the active node
  assert.equal(src.open, true) // so it auto-opens
  const utils = src.children[0]
  assert.equal(utils.open, true) // the whole branch down to the active node opens
  assert.equal(utils.children[0].active, true)
})

test('an unrelated branch stays closed; an explicit open flag wins over relevance', () => {
  const r = resolveTree(
    [
      { label: 'a', open: true, children: [{ label: 'a1', href: '/a1' }] },
      { label: 'b', children: [{ label: 'b1', href: '/b1' }] },
    ],
    '/nowhere',
  )
  assert.equal(r[0].open, true) // explicit flag
  assert.equal(r[1].open, false) // not relevant, no flag
})

test('a node with a selected flag is active even without an href match', () => {
  const [n] = resolveTree([{ label: 'pinned', selected: true }], null)
  assert.equal(n.active, true)
})

test('samePath ignores hash/query + a trailing slash, and rejects non-strings', () => {
  assert.equal(samePath('/a/b', '/a/b/'), true)
  assert.equal(samePath('/a/b#x', '/a/b?y=1'), true)
  assert.equal(samePath('/a', '/a/b'), false)
  assert.equal(samePath(null, '/a'), false)
})
