// Render tests for the Vue ThemeProvider binding (jsdom, .vue SFC via @vue/test-utils).
// Vue twin of the React regression: the provider must honor theme/appearance prop
// changes after mount, without clobbering a user selection.
import { test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, inject } from 'vue'
import ThemeProvider from '../vue/ThemeProvider.vue'
import { THEME_KEY } from '../vue/context.js'

const Probe = {
  setup() {
    const ctx = inject(THEME_KEY)
    return () => h('div', { 'data-testid': 'probe' }, `${ctx.themeName.value}:${ctx.appearance.value}`)
  },
}

test('vue provider picks up an appearance prop change after mount', async () => {
  const wrapper = mount(ThemeProvider, {
    props: { appearance: 'system' },
    slots: { default: () => h(Probe) },
  })
  expect(wrapper.get('[data-testid="probe"]').text()).toMatch(/:system$/)
  await wrapper.setProps({ appearance: 'dark' }) // page-level override on nav
  expect(wrapper.get('[data-testid="probe"]').text()).toMatch(/:dark$/)
})

test('vue provider keeps a user selection across an unrelated re-render', async () => {
  let ctx
  const Grab = {
    setup() {
      ctx = inject(THEME_KEY)
      return () => null
    },
  }
  const wrapper = mount(ThemeProvider, {
    props: { appearance: 'system' },
    slots: { default: () => h(Grab) },
  })
  ctx.setAppearance('dark') // user flips it
  await wrapper.setProps({ appearance: 'system' }) // same prop again must not reset
  expect(ctx.appearance.value).toBe('dark')
})
