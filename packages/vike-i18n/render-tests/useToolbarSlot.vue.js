// Vue twin of the leak-fix guard: useToolbarSlot must disconnect its MutationObserver
// on unmount (the bug the observer used to leak because onUnmounted was missing).
import { test, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { useToolbarSlot } from '../vue/useToolbarSlot.js'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

test('disconnects its MutationObserver on unmount', () => {
  document.body.innerHTML = '<div id="vike-toolbar-root"></div>'
  const spy = vi.spyOn(MutationObserver.prototype, 'disconnect')
  const Comp = {
    setup() {
      useToolbarSlot()
      return () => null
    },
  }
  const wrapper = mount(Comp)
  wrapper.unmount()
  expect(spy).toHaveBeenCalled()
})
