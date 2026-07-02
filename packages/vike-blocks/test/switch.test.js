// The switch block: a dep-free, theme-native toggle control (defineBlock, type 'switch', builder
// `toggle`) with label / checked / disabled / name refinements and an animated sliding thumb. The
// renderer is not node:test-tested (JSX/Vue stateful), so this covers the agnostic builder + resolve
// plus the shared style module (track fill, thumb slide, the states style tag).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toggle, field, definePage, resolvePage, hasBlock } from '../index.js'
import { switchTrackStyle, switchThumbStyle, SWITCH_STYLE_TAG } from '../switch-styles.js'

test('switch is registered', () => {
  assert.ok(hasBlock('switch'))
})

test('the builder collapses to a descriptor of type "switch" (label optional)', () => {
  assert.deepEqual(toggle('Dark mode').build(), { block: 'switch', label: 'Dark mode' })
  assert.deepEqual(toggle('Notifications').checked().build(), { block: 'switch', label: 'Notifications', checked: true })
  assert.deepEqual(toggle('Locked').checked().disabled().name('dark').build(), {
    block: 'switch',
    label: 'Locked',
    checked: true,
    disabled: true,
    name: 'dark',
  })
  assert.deepEqual(toggle().build(), { block: 'switch' }) // no label
})

test('resolves as a pass-through section', () => {
  const out = resolvePage(definePage({ sections: [toggle('Auto-save').checked()] }))
  assert.equal(out.sections[0].block, 'switch')
  assert.deepEqual(out.sections[0].resolved, { label: 'Auto-save', checked: true })
})

test('composes as a field control', () => {
  const out = resolvePage(definePage({ sections: [field('Appearance').control(toggle('Dark mode').checked())] }))
  assert.equal(out.sections[0].resolved.control.block, 'switch')
  assert.deepEqual(out.sections[0].resolved.control.resolved, { label: 'Dark mode', checked: true })
})

test('switchTrackStyle fills with the primary color only when on', () => {
  assert.match(switchTrackStyle(true).background, /var\(--color-primary/)
  assert.match(switchTrackStyle(false).background, /var\(--color-surface/)
})

test('switchThumbStyle slides the thumb across when on', () => {
  assert.match(switchThumbStyle(true).transform, /translate\(1rem/)
  assert.match(switchThumbStyle(false).transform, /translate\(0/)
})

test('the states style tag covers focus-visible and disabled', () => {
  assert.match(SWITCH_STYLE_TAG, /:focus-visible\{[^}]*box-shadow/)
  assert.match(SWITCH_STYLE_TAG, /:disabled\{opacity:\.5\}/)
})
