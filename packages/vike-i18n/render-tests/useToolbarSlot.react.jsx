// Guards the leak fix: the React useToolbarSlot must disconnect its MutationObserver
// when the component unmounts before the toolbar panel ever portals in.
import { test, expect, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { useToolbarSlot } from '../react/useToolbarSlot.js'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

test('disconnects its MutationObserver on unmount', () => {
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
