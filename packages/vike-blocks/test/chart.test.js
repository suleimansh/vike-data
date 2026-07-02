// The chart block: a dep-free bar / line / area chart (defineBlock, type 'chart', builder `chart`) with
// type / height / color / max refinements. The renderers are not node:test-tested (SVG output), so this
// covers the agnostic builder + resolve and the shared geometry module (series normalization, the nice
// scale, and the bar / line / area layout math the SVG is drawn from).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chart, definePage, resolvePage, hasBlock } from '../index.js'
import { normalizeSeries, chartScaleMax, chartGeometry, CHART_WIDTH } from '../chart-styles.js'

test('chart is registered', () => {
  assert.ok(hasBlock('chart'))
})

test('the builder collapses to a descriptor; type is clamped, unknown -> bar', () => {
  assert.deepEqual(chart([1, 2, 3]).build(), { block: 'chart', data: [1, 2, 3] })
  const full = chart([{ label: 'A', value: 5 }]).type('area').height(200).color('red').max(10).build()
  assert.deepEqual(full, { block: 'chart', data: [{ label: 'A', value: 5 }], type: 'area', height: 200, color: 'red', max: 10 })
  assert.equal(chart([]).type('pie').build().type, 'bar') // unsupported type falls back
  assert.deepEqual(chart('nope').build().data, []) // non-array data -> empty series
})

test('resolves as a pass-through section', () => {
  const out = resolvePage(definePage({ sections: [chart([3, 1, 4]).type('line')] }))
  assert.equal(out.sections[0].block, 'chart')
  assert.deepEqual(out.sections[0].resolved, { data: [3, 1, 4], type: 'line' })
})

test('normalizeSeries accepts numbers and objects, coercing bad values to 0', () => {
  assert.deepEqual(normalizeSeries([1, 2]), [{ label: '', value: 1 }, { label: '', value: 2 }])
  assert.deepEqual(normalizeSeries([{ label: 'Mon', value: 12 }]), [{ label: 'Mon', value: 12 }])
  assert.deepEqual(normalizeSeries([{ label: 5, value: 'x' }]), [{ label: '5', value: 0 }])
  assert.deepEqual(normalizeSeries('nope'), [])
})

test('chartScaleMax rounds up to a nice number, honors an explicit max, and never returns 0', () => {
  assert.equal(chartScaleMax([12, 18, 7]), 20) // 18 -> nice 20
  assert.equal(chartScaleMax([4, 8, 15, 16, 23, 42]), 50) // 42 -> nice 50
  assert.equal(chartScaleMax([120, 300]), 500) // 300 -> nice 500
  assert.equal(chartScaleMax([12, 18], 100), 100) // explicit wins
  assert.equal(chartScaleMax([0, 0]), 1) // all-zero series still has a valid scale
})

test('bar layout: n equal slots, centered bars, height scaled to the resolved max', () => {
  const geo = chartGeometry([{ label: '', value: 5 }, { label: '', value: 10 }], { height: 100, max: 10 })
  assert.equal(geo.scaleMax, 10)
  assert.equal(geo.bars.length, 2)
  // the value-10 bar reaches the full inner height; the value-5 bar is half of it
  assert.ok(Math.abs(geo.bars[1].height - geo.bars[0].height * 2) < 0.001)
  // bars sit inside the box and don't overlap (bar0 right edge < bar1 left edge)
  assert.ok(geo.bars[0].x + geo.bars[0].width <= geo.bars[1].x)
  assert.ok(geo.bars[1].x + geo.bars[1].width <= CHART_WIDTH)
})

test('line/area layout: points span edge-to-edge and build valid paths', () => {
  const geo = chartGeometry([{ label: '', value: 0 }, { label: '', value: 5 }, { label: '', value: 10 }], { height: 100, max: 10 })
  assert.equal(geo.points.length, 3)
  assert.ok(geo.points[2].x > geo.points[0].x) // last point is to the right of the first
  assert.ok(geo.points[0].y > geo.points[2].y) // value 0 sits lower (larger y) than value 10
  assert.match(geo.linePath, /^M[\d.,-]+ L/) // starts with a move then a line
  assert.match(geo.areaPath, /Z$/) // area path is closed back to the baseline
})

test('a single point sits at the left edge without dividing by zero', () => {
  const geo = chartGeometry([{ label: '', value: 3 }], { height: 80 })
  assert.equal(geo.points.length, 1)
  assert.ok(Number.isFinite(geo.points[0].x))
  assert.ok(Number.isFinite(geo.points[0].y))
})
