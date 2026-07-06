// Vue twin of the leak-fix guard at its canonical home: useToolbarSlot must disconnect its
// MutationObserver on unmount (the bug the observer used to leak when onUnmounted was
// missing). Single source vike-themes / vike-i18n import (was hand-copied — #683).
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

test('resolves the teleport slot when the panel is already present', () => {
  document.body.innerHTML = '<div id="vike-toolbar-root"></div><div id="vike-toolbar-items"></div>'
  let seen
  const Comp = {
    setup() {
      seen = useToolbarSlot()
      return () => null
    },
  }
  mount(Comp)
  expect(seen.value).toBe(document.getElementById('vike-toolbar-items'))
})

test('falls back to standalone (null) when no toolbar is installed', () => {
  document.body.innerHTML = ''
  let seen
  const Comp = {
    setup() {
      seen = useToolbarSlot()
      return () => null
    },
  }
  mount(Comp)
  expect(seen.value).toBe(null)
})
