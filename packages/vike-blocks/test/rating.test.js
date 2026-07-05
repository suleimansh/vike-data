// The rating block: a defineBlock leaf (build + refine) for a star rating, plus the pure helpers the
// renderers share (pointer x -> value, per-star fill, snap-to-grid). Renderers (react/vue) are DOM-only
// and not node:test-tested; the pointer/fill math carries the correctness, so it is unit-tested here.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rating, definePage, resolvePage, hasBlock } from '../index.js'
import { ratingValueAt, starFill, snapRating } from '../blocks/rating-styles.js'

test('rating is registered', () => {
  assert.ok(hasBlock('rating'))
})

test('the builder maps the fluent setters onto the descriptor', () => {
  const desc = rating('Rate us').value(3.5).max(5).allowHalf().readOnly().name('score').build()
  assert.deepEqual(desc, { block: 'rating', label: 'Rate us', value: 3.5, max: 5, allowHalf: true, readOnly: true, name: 'score' })
})

test('a bare rating carries no optional keys; resolve passes props through', () => {
  const desc = rating().build()
  assert.deepEqual(desc, { block: 'rating' })
  const r = resolvePage(definePage({ sections: [rating('X').value(4)] })).sections[0]
  assert.equal(r.block, 'rating')
  assert.deepEqual(r.resolved, { label: 'X', value: 4 })
})

// ---- snapRating -----------------------------------------------------------------------------------

test('snapRating rounds to whole stars, or halves when allowed, and clamps to [0, max]', () => {
  assert.equal(snapRating(3.4, 5, false), 3)
  assert.equal(snapRating(3.4, 5, true), 3.5)
  assert.equal(snapRating(3.7, 5, true), 3.5)
  assert.equal(snapRating(-2, 5, true), 0)
  assert.equal(snapRating(9, 5, false), 5)
})

// ---- starFill -------------------------------------------------------------------------------------

test('starFill reports each star full / half / empty for a rating', () => {
  // value 3.5: stars 0,1,2 full, star 3 half, star 4 empty
  assert.deepEqual([0, 1, 2, 3, 4].map((i) => starFill(i, 3.5)), [1, 1, 1, 0.5, 0])
})

// ---- ratingValueAt --------------------------------------------------------------------------------

const rect = { left: 0, width: 100 } // 5 stars over 100px -> 20px each

test('ratingValueAt rounds up to the whole star under the pointer', () => {
  assert.equal(ratingValueAt(1, rect, 5, false), 1) // just inside star 1
  assert.equal(ratingValueAt(25, rect, 5, false), 2) // inside star 2
  assert.equal(ratingValueAt(100, rect, 5, false), 5) // far right = max
})

test('with half-steps, the left half of a star is x.5 and the right half is x+1', () => {
  assert.equal(ratingValueAt(5, rect, 5, true), 0.5) // first 10px = left half of star 1
  assert.equal(ratingValueAt(15, rect, 5, true), 1) // 10-20px = right half of star 1
  assert.equal(ratingValueAt(45, rect, 5, true), 2.5) // left half of star 3
})

test('ratingValueAt clamps into range and returns null without a measurable row', () => {
  assert.equal(ratingValueAt(-50, rect, 5, false), 1) // below the first star clamps up to the min step
  assert.equal(ratingValueAt(999, rect, 5, true), 5) // beyond the row clamps to max
  assert.equal(ratingValueAt(10, { left: 0, width: 0 }, 5, false), null)
})
