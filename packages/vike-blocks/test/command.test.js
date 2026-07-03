// The command block: a dep-free, theme-native ⌘K command palette. The renderer is not node:test-tested
// (JSX/Vue, Overlay portal, global hotkey), so this covers the agnostic builder + resolve (groups /
// items / hotkey / trigger defaults) and the pure `filterCommands` helper (label filter + the flat list
// both renderers use for arrow-key nav).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { command, definePage, resolvePage, hasBlock } from '../index.js'
import { filterCommands } from '../command-styles.js'

test('command is registered', () => {
  assert.ok(hasBlock('command'))
})

test('the builder groups items and collapses to a descriptor', () => {
  assert.deepEqual(
    command().placeholder('Search…').hotkey('p').group('Navigation').item('Dashboard', { to: '/', shortcut: '⌘H' }).item('Users', { to: '/admin/users' }).group('Actions').item('New post', { to: '/posts/new' }).build(),
    {
      block: 'command',
      placeholder: 'Search…',
      empty: 'No results found.',
      hotkey: 'p',
      groups: [
        { label: 'Navigation', items: [{ label: 'Dashboard', to: '/', shortcut: '⌘H' }, { label: 'Users', to: '/admin/users' }] },
        { label: 'Actions', items: [{ label: 'New post', to: '/posts/new' }] },
      ],
    },
  )
})

test('items before any .group() land in an unlabeled first group', () => {
  const d = command().item('Loose one', { to: '/x' }).build()
  assert.deepEqual(d.groups, [{ items: [{ label: 'Loose one', to: '/x' }] }])
})

test('resolve fills defaults (trigger, hotkey) and normalizes items', () => {
  const out = resolvePage(definePage({ sections: [command().group('G').item('A', { to: '/a' }).item('B')] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'command')
  assert.equal(r.trigger, 'Search...')
  assert.equal(r.hotkey, 'k')
  assert.deepEqual(r.groups[0].items[0], { label: 'A', to: '/a', shortcut: null })
  assert.deepEqual(r.groups[0].items[1], { label: 'B', to: null, shortcut: null })
})

test('filterCommands: filters by label, drops empty groups, and returns the flat order', () => {
  const groups = [
    { label: 'Nav', items: [{ label: 'Dashboard' }, { label: 'Users' }] },
    { label: 'Actions', items: [{ label: 'New post' }, { label: 'Delete user' }] },
  ]
  const all = filterCommands(groups, '')
  assert.equal(all.groups.length, 2)
  assert.deepEqual(all.flat.map((i) => i.label), ['Dashboard', 'Users', 'New post', 'Delete user'])

  const user = filterCommands(groups, 'user')
  assert.deepEqual(user.groups.map((g) => g.label), ['Nav', 'Actions']) // both keep a match
  assert.deepEqual(user.flat.map((i) => i.label), ['Users', 'Delete user'])

  const dash = filterCommands(groups, 'DASH') // case-insensitive
  assert.equal(dash.groups.length, 1) // the Actions group drops out
  assert.deepEqual(dash.flat.map((i) => i.label), ['Dashboard'])

  assert.equal(filterCommands(groups, 'zzz').flat.length, 0)
})
