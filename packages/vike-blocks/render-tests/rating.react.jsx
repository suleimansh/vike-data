// The React rating renderer already derives its config each render; pin that so the
// twin stays in parity with the Vue fix.
import { test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { RatingView } from '../react/RatingView.jsx'

test('re-renders its star count when max changes', () => {
  const { container, rerender } = render(<RatingView value={2} max={5} />)
  expect(container.querySelectorAll('.vike-blocks-rating-fill')).toHaveLength(5)
  rerender(<RatingView value={2} max={3} />)
  expect(container.querySelectorAll('.vike-blocks-rating-fill')).toHaveLength(3)
})
