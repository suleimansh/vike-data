// Render tests for the React ThemeProvider binding (jsdom). Regression cover for the
// bug where the provider seeded state from props once and ignored later prop changes
// (page-level theme/appearance overrides after a client nav).
import { test, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { useContext } from 'react'
import { ThemeProvider } from '../react/ThemeProvider.jsx'
import { ThemeCtx } from '../react/context.js'

function Probe() {
  const { themeName, appearance } = useContext(ThemeCtx)
  return <div data-testid="probe">{`${themeName}:${appearance}`}</div>
}

test('picks up an appearance prop change after mount', () => {
  const { rerender } = render(
    <ThemeProvider appearance="system">
      <Probe />
    </ThemeProvider>,
  )
  expect(screen.getByTestId('probe').textContent).toMatch(/:system$/)
  // a client-side nav hands the provider a new page-level override
  rerender(
    <ThemeProvider appearance="dark">
      <Probe />
    </ThemeProvider>,
  )
  expect(screen.getByTestId('probe').textContent).toMatch(/:dark$/)
})

test('a user selection is not clobbered by an unrelated re-render', () => {
  let ctx
  function Grab() {
    ctx = useContext(ThemeCtx)
    return null
  }
  const { rerender } = render(
    <ThemeProvider appearance="system">
      <Grab />
    </ThemeProvider>,
  )
  act(() => ctx.setAppearance('dark')) // user flips the switch
  rerender(
    <ThemeProvider appearance="system">
      <Grab />
    </ThemeProvider>,
  ) // re-render with the SAME prop must not reset it
  expect(ctx.appearance).toBe('dark')
})
