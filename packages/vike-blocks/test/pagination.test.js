// The pagination block: dep-free, theme-native page navigation harvested from shadcn's Pagination. The
// renderer is not node:test-tested (JSX/Vue), so this covers the agnostic builder + resolve and — the
// heart of the block — the pure `paginationRange` algorithm both renderers share (which pages to show,
// where the ellipsis gaps fall).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pagination, definePage, resolvePage, hasBlock } from '../index.js'
import { paginationRange } from '../blocks/pagination-styles.js'

test('pagination is registered', () => {
  assert.ok(hasBlock('pagination'))
})

test('the builder collapses to a descriptor', () => {
  assert.deepEqual(pagination(3, 10).href('/posts?page={page}').siblings(2).prevLabel('Prev').nextLabel('More').build(), {
    block: 'pagination',
    page: 3,
    pageCount: 10,
    siblings: 2,
    prevLabel: 'Prev',
    nextLabel: 'More',
    hrefTemplate: '/posts?page={page}',
  })
  // defaults: page/count fall back to 1, siblings 1, labels Previous/Next, no template
  assert.deepEqual(pagination().build(), { block: 'pagination', page: 1, pageCount: 1, siblings: 1, prevLabel: 'Previous', nextLabel: 'Next' })
})

test('resolve passes the paging state through with defaults', () => {
  const out = resolvePage(definePage({ sections: [pagination(4, 12).href('/x?page={page}')] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'pagination')
  assert.equal(r.page, 4)
  assert.equal(r.pageCount, 12)
  assert.equal(r.siblings, 1)
  assert.equal(r.hrefTemplate, '/x?page={page}')
})

test('paginationRange: middle page shows both ellipsis gaps', () => {
  assert.deepEqual(paginationRange(6, 10, 1), [1, 'ellipsis', 5, 6, 7, 'ellipsis', 10])
})

test('paginationRange: near the start / end, only one gap', () => {
  assert.deepEqual(paginationRange(1, 5, 1), [1, 2, 'ellipsis', 5])
  assert.deepEqual(paginationRange(5, 5, 1), [1, 'ellipsis', 4, 5])
})

test('paginationRange: siblings widens the window', () => {
  assert.deepEqual(paginationRange(5, 10, 2), [1, 'ellipsis', 3, 4, 5, 6, 7, 'ellipsis', 10])
})

test('paginationRange: small totals need no ellipsis, and clamp/edge cases are safe', () => {
  assert.deepEqual(paginationRange(2, 3, 1), [1, 2, 3]) // no gaps
  assert.deepEqual(paginationRange(1, 1, 1), [1]) // single page
  assert.deepEqual(paginationRange(1, 0, 1), []) // nothing to page
  assert.deepEqual(paginationRange(99, 5, 1), [1, 'ellipsis', 4, 5]) // page clamps to the last
})
