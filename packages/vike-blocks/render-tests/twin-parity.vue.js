// Twin-parity locks for #654: the Vue overlay renderers used to wrap their output in an extra root
// element (a <span data-slot> / display:contents span) that the React twins — which return a fragment —
// never emit, and the Select/NavMenu <style> was nested inside the wrap element instead of sitting
// beside it. These pin the corrected fragment shape so the Vue side can't drift back.
import { test, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { DialogView } from '../vue/DialogView.js'
import { SheetView } from '../vue/SheetView.js'
import { DrawerView } from '../vue/DrawerView.js'
import { CommandView } from '../vue/CommandView.js'
import { ConfirmView } from '../vue/ConfirmView.js'
import { ToggleButtonView, ToggleGroupView } from '../vue/ToggleView.js'
import { SelectView } from '../vue/SelectView.js'
import { NavMenuView } from '../vue/NavMenuView.js'
import { DocNavView } from '../vue/DocNavView.js'
import { List } from '../vue/primitives.js'

// --- Overlay renderers: the trigger is a root node, not wrapped in a data-slot span (React returns <>) ---

test('dialog renders the trigger without a wrapper element', () => {
  const w = mount(DialogView, { props: { title: 'Hi', trigger: 'Open' } })
  expect(w.find('[data-slot="dialog"]').exists()).toBe(false)
  expect(w.get('button').text()).toBe('Open')
})

test('sheet renders the trigger without a wrapper element', () => {
  const w = mount(SheetView, { props: { title: 'Hi', trigger: 'Open' } })
  expect(w.find('[data-slot="sheet"]').exists()).toBe(false)
  expect(w.get('button').text()).toBe('Open')
})

test('drawer renders the trigger without a wrapper element', () => {
  const w = mount(DrawerView, { props: { title: 'Hi', trigger: 'Open' } })
  expect(w.find('[data-slot="drawer"]').exists()).toBe(false)
  expect(w.get('button').text()).toBe('Open')
})

test('command renders the trigger without a command-root wrapper', () => {
  const w = mount(CommandView, { props: { trigger: 'Search', groups: [] } })
  expect(w.find('[data-slot="command-root"]').exists()).toBe(false)
  expect(w.find('[data-slot="command-trigger"]').exists()).toBe(true)
})

test('confirm (nav mode) renders the trigger without a wrapper element', () => {
  const w = mount(ConfirmView, { props: { label: 'Delete', to: '/x' } })
  expect(w.find('[data-slot="confirm"]').exists()).toBe(false)
  expect(w.get('button').text()).toBe('Delete')
})

test('confirm (form mode) renders the form without a wrapper element', () => {
  const w = mount(ConfirmView, { props: { label: 'Delete', action: { method: 'post', to: '/x' }, fields: [{ name: 'id', value: '1' }] } })
  expect(w.find('[data-slot="confirm"]').exists()).toBe(false)
  expect(w.find('form').exists()).toBe(true)
})

test('toggle-button renders no display:contents wrapper span', () => {
  const w = mount(ToggleButtonView, { props: { label: 'Bold' } })
  expect(w.html()).not.toContain('display: contents')
  expect(w.get('button[data-slot="toggle"]').text()).toBe('Bold')
})

test('toggle-group renders no display:contents wrapper span', () => {
  const w = mount(ToggleGroupView, { props: { items: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] } })
  expect(w.html()).not.toContain('display: contents')
  expect(w.find('[data-slot="toggle-group"]').exists()).toBe(true)
})

// --- Select / NavMenu: the <style> tag is a fragment sibling, not nested inside the wrap element ---

test('select keeps <style> a sibling of the wrap span, not nested inside it', () => {
  const w = mount(SelectView, { props: { options: [{ value: 'a', label: 'A' }], placeholder: 'Pick' } })
  const wrap = w.get('select').element.parentElement
  expect(wrap.tagName).toBe('SPAN')
  expect(wrap.querySelector('style')).toBe(null)
  expect(w.find('style').exists()).toBe(true)
})

test('nav-menu keeps <style> a sibling of the nav, not nested inside it', () => {
  const w = mount(NavMenuView, { props: { items: [{ to: '/a', label: 'A' }] } })
  const nav = w.get('nav[data-slot="nav-menu"]').element
  expect(nav.querySelector('style')).toBe(null)
  expect(w.find('style').exists()).toBe(true)
})

// --- List keys: reconciliation stays correct across re-renders (page-links were unkeyed) ---

test('doc-nav re-associates a page-link with its sections when the active page changes (keyed)', async () => {
  const w = mount(DocNavView, {
    props: {
      collapsible: true,
      items: [
        { type: 'link', label: 'A', href: '/a', active: true, sections: [{ label: 'A1', href: '#a1' }] },
        { type: 'link', label: 'B', href: '/b', active: false },
      ],
    },
  })
  expect(w.findAll('.vike-blocks-docnav-section').map((s) => s.text())).toEqual(['A1'])
  await w.setProps({
    items: [
      { type: 'link', label: 'A', href: '/a', active: false },
      { type: 'link', label: 'B', href: '/b', active: true, sections: [{ label: 'B1', href: '#b1' }] },
    ],
  })
  expect(w.findAll('.vike-blocks-docnav-section').map((s) => s.text())).toEqual(['B1'])
})

test('list renders its items and updates on prop change (keyed)', async () => {
  const w = mount(List, { props: { items: ['a', 'b', 'c'] } })
  expect(w.findAll('li').map((li) => li.text())).toEqual(['a', 'b', 'c'])
  await w.setProps({ items: ['x', 'y'] })
  expect(w.findAll('li').map((li) => li.text())).toEqual(['x', 'y'])
})
