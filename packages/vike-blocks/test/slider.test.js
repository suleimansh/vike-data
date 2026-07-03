// The slider block: a dep-free, theme-native range control (defineBlock, type 'slider', builder
// `slider`) with label / min / max / step / value / disabled / name refinements. The renderer is not
// node:test-tested (JSX/Vue stateful, pointer + keyboard), so this covers the agnostic builder +
// resolve plus the shared style/math module (percent, step snapping, the fill/thumb, the states tag).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { slider, field, definePage, resolvePage, hasBlock } from '../index.js'
import { sliderPercent, snapToStep, sliderRangeStyle, sliderThumbStyle, SLIDER_STYLE_TAG } from '../blocks/slider-styles.js'

test('slider is registered', () => {
  assert.ok(hasBlock('slider'))
})

test('the builder collapses to a descriptor of type "slider" (label optional)', () => {
  assert.deepEqual(slider().build(), { block: 'slider' })
  assert.deepEqual(slider('Volume').value(70).build(), { block: 'slider', label: 'Volume', value: 70 })
  assert.deepEqual(slider().min(0).max(100).step(5).value(40).disabled().name('vol').build(), {
    block: 'slider',
    min: 0,
    max: 100,
    step: 5,
    value: 40,
    disabled: true,
    name: 'vol',
  })
})

test('resolves as a pass-through section', () => {
  const out = resolvePage(definePage({ sections: [slider('Volume').value(70)] }))
  assert.equal(out.sections[0].block, 'slider')
  assert.deepEqual(out.sections[0].resolved, { label: 'Volume', value: 70 })
})

test('composes as a field control', () => {
  const out = resolvePage(definePage({ sections: [field('Volume').control(slider().value(30))] }))
  assert.equal(out.sections[0].resolved.control.block, 'slider')
  assert.deepEqual(out.sections[0].resolved.control.resolved, { value: 30 })
})

test('sliderPercent maps the value onto the rail and clamps out-of-range', () => {
  assert.equal(sliderPercent(50, 0, 100), 50)
  assert.equal(sliderPercent(0, 0, 100), 0)
  assert.equal(sliderPercent(100, 0, 100), 100)
  assert.equal(sliderPercent(-20, 0, 100), 0) // clamp below
  assert.equal(sliderPercent(200, 0, 100), 100) // clamp above
  assert.equal(sliderPercent(5, 5, 5), 0) // degenerate range -> pinned, no divide-by-zero
})

test('snapToStep snaps to the nearest step and clamps to the range', () => {
  assert.equal(snapToStep(42, 0, 100, 10), 40)
  assert.equal(snapToStep(47, 0, 100, 10), 50)
  assert.equal(snapToStep(-5, 0, 100, 10), 0) // clamp low
  assert.equal(snapToStep(999, 0, 100, 10), 100) // clamp high
  assert.equal(snapToStep(3.7, 0, 10, 0), 4) // step<=0 falls back to 1
})

test('sliderRangeStyle fills the primary color up to the value percent', () => {
  assert.equal(sliderRangeStyle(60).width, '60%')
  assert.match(sliderRangeStyle(60).background, /var\(--color-primary/)
})

test('sliderThumbStyle positions the thumb at the value percent', () => {
  assert.equal(sliderThumbStyle(60).left, '60%')
  assert.match(sliderThumbStyle(60).transform, /translate\(-50%/)
})

test('the states style tag covers the focus-visible ring on the thumb', () => {
  assert.match(SLIDER_STYLE_TAG, /slider-thumb:focus-visible\{[^}]*box-shadow/)
})
