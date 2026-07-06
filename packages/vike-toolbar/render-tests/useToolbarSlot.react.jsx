// Guards the leak fix at its canonical home: the React useToolbarSlot must disconnect its
// MutationObserver when the component unmounts before the toolbar panel ever portals in.
// This is the single source vike-themes / vike-i18n import (was hand-copied — #683).
import { test, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { useToolbarSlot } from '../react/useToolbarSlot.js'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

test('disconnects its MutationObserver on unmount', () => {
  // toolbar installed (root present) but items not portaled yet -> the observer branch runs
  document.body.innerHTML = '<div id="vike-toolbar-root"></div>'
  const spy = vi.spyOn(MutationObserver.prototype, 'disconnect')
  function Uses() {
    useToolbarSlot()
    return null
  }
  const { unmount } = render(<Uses />)
  unmount()
  expect(spy).toHaveBeenCalled()
})

test('resolves the teleport slot when the panel is already present', () => {
  document.body.innerHTML = '<div id="vike-toolbar-root"></div><div id="vike-toolbar-items"></div>'
  let seen
  function Uses() {
    seen = useToolbarSlot()
    return null
  }
  render(<Uses />)
  expect(seen).toBe(document.getElementById('vike-toolbar-items'))
})

test('falls back to standalone (null) when no toolbar is installed', () => {
  document.body.innerHTML = ''
  let seen = 'unset'
  function Uses() {
    seen = useToolbarSlot()
    return null
  }
  render(<Uses />)
  expect(seen).toBe(null)
})
