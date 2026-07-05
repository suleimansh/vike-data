// Regression cover for the Vue rating renderer: it read max/allowHalf/readOnly once in
// setup(), so a re-render with new props kept a stale star count / aria. It must react.
import { test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { RatingView } from '../vue/RatingView.js'

test('re-renders its star count when max changes', async () => {
  const w = mount(RatingView, { props: { value: 2, max: 5 } })
  expect(w.findAll('.vike-blocks-rating-fill')).toHaveLength(5)
  await w.setProps({ max: 3 })
  expect(w.findAll('.vike-blocks-rating-fill')).toHaveLength(3)
})

test('reflects readOnly changing after mount (role + aria)', async () => {
  const w = mount(RatingView, { props: { value: 3, max: 5, readOnly: false } })
  expect(w.get('.vike-blocks-rating').attributes('role')).toBe('slider')
  await w.setProps({ readOnly: true })
  expect(w.get('.vike-blocks-rating').attributes('role')).toBe('img')
})
