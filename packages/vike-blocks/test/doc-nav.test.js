// The doc-nav block: a fluent builder for a documentation sidebar tree (collapsible categories, page
// links, on-page section splice) and the pure model helpers behind it (resolveDocNav active/relevant,
// samePath, and the leveled -> grouped adapter). Renderers (react/vue) are not node:test-tested
// (JSX/Vue); this covers the agnostic authoring + resolve.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { docNav, definePage, resolvePage, hasBlock } from '../index.js'
import { resolveDocNav, groupLeveledItems, samePath } from '../blocks/doc-nav-styles.js'

test('doc-nav is registered', () => {
  assert.ok(hasBlock('doc-nav'))
})

test('the builder collapses to a descriptor with groups, links, and normalized sections', () => {
  const desc = docNav()
    .current('/guide/setup')
    .group('Guide', [
      { label: 'Intro', href: '/guide/intro' },
      { label: 'Setup', href: '/guide/setup', sections: [['Install', '#install'], { label: 'Config', href: '#config' }] },
    ])
    .link('Changelog', '/changelog')
    .build()
  assert.equal(desc.block, 'doc-nav')
  assert.equal(desc.current, '/guide/setup')
  assert.equal(desc.collapsible, true)
  assert.equal(desc.items[0].type, 'group')
  assert.equal(desc.items[0].label, 'Guide')
  assert.deepEqual(desc.items[0].links[0], { label: 'Intro', href: '/guide/intro' })
  // tuple + object sections both normalize to { label, href }
  assert.deepEqual(desc.items[0].links[1].sections, [{ label: 'Install', href: '#install' }, { label: 'Config', href: '#config' }])
  assert.deepEqual(desc.items[1], { type: 'link', label: 'Changelog', href: '/changelog' })
})

test('collapsible(false) pins categories open', () => {
  assert.equal(docNav().collapsible(false).build().collapsible, false)
})

test('samePath ignores hash / query / trailing slash and is exact (not prefix)', () => {
  assert.equal(samePath('/guide/setup', '/guide/setup/'), true)
  assert.equal(samePath('/guide/setup#install', '/guide/setup'), true)
  assert.equal(samePath('/guide/setup?x=1', '/guide/setup'), true)
  assert.equal(samePath('/guide/setup', '/guide'), false) // a descendant is not the same page
  assert.equal(samePath('/', '/'), true)
})

test('resolve marks the current page active and its group relevant; siblings inactive', () => {
  const r = resolvePage(
    definePage({
      sections: [
        docNav()
          .current('/guide/setup')
          .group('Guide', [{ label: 'Intro', href: '/guide/intro' }, { label: 'Setup', href: '/guide/setup' }])
          .group('API', [{ label: 'CLI', href: '/api/cli' }]),
      ],
    }),
  ).sections[0]
  assert.equal(r.block, 'doc-nav')
  const [guide, api] = r.resolved.items
  assert.equal(guide.active, true) // holds the current page -> relevant
  assert.equal(guide.links[0].active, false)
  assert.equal(guide.links[1].active, true)
  assert.equal(api.active, false)
})

test('sections are attached to a page and resolved (the renderer reveals them only when active)', () => {
  const r = resolveDocNav(
    [{ type: 'group', label: 'Guide', links: [{ label: 'Setup', href: '/s', sections: [{ label: 'Install', href: '#i' }] }] }],
    '/s',
  )
  const link = r[0].links[0]
  assert.equal(link.active, true)
  assert.deepEqual(link.sections, [{ label: 'Install', href: '#i' }])
})

test('groupLeveledItems adapts a flat leveled nav list into grouped items', () => {
  const items = groupLeveledItems([
    { level: 1, title: 'Guide', color: '#f80' },
    { level: 2, title: 'Intro', url: '/guide/intro' },
    { level: 2, title: 'Setup', url: '/guide/setup' },
    { level: 3, title: 'Install', url: '#install' }, // splices under Setup (the page above it)
    { level: 4, title: 'ignored-column-hint' },
    { level: 1, title: 'API' },
    { level: 2, title: 'CLI', url: '/api/cli' },
  ])
  assert.equal(items.length, 2)
  assert.deepEqual(items[0], {
    type: 'group',
    label: 'Guide',
    color: '#f80',
    links: [
      { label: 'Intro', href: '/guide/intro' },
      { label: 'Setup', href: '/guide/setup', sections: [{ label: 'Install', href: '#install' }] },
    ],
  })
  assert.equal(items[1].label, 'API')
  assert.deepEqual(items[1].links, [{ label: 'CLI', href: '/api/cli' }])
})

test('groupLeveledItems places pages before any category as top-level links (and still attaches sections)', () => {
  const items = groupLeveledItems([
    { level: 2, title: 'Home', url: '/' },
    { level: 3, title: 'Top', url: '#top' },
  ])
  assert.deepEqual(items, [{ type: 'link', label: 'Home', href: '/', sections: [{ label: 'Top', href: '#top' }] }])
})

test('.tree() appends a prebuilt item list (the adapter path)', () => {
  const built = groupLeveledItems([{ level: 1, title: 'Guide' }, { level: 2, title: 'Intro', url: '/guide/intro' }])
  const desc = docNav().current('/guide/intro').tree(built).build()
  assert.equal(desc.items[0].label, 'Guide')
  assert.equal(desc.items[0].links[0].href, '/guide/intro')
})
