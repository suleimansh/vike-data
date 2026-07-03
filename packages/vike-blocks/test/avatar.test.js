// The avatar + avatarGroup blocks: a dep-free, theme-native user image with an initials fallback, and an
// overlapping group with a "+N" count. The renderers are not node:test-tested (JSX/Vue), so this covers
// the agnostic builders + resolve (initials derivation, defaults, the group cap/overflow) + the pure
// `initials` helper.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { avatar, avatarGroup, definePage, resolvePage, hasBlock } from '../index.js'
import { initials, statusColor } from '../blocks/avatar-styles.js'

test('avatar + avatarGroup are registered', () => {
  assert.ok(hasBlock('avatar'))
  assert.ok(hasBlock('avatarGroup'))
})

test('initials: full name -> first+last, mononym -> first letter, empty -> ""', () => {
  assert.equal(initials('Ada Lovelace'), 'AL')
  assert.equal(initials('grace hopper'), 'GH')
  assert.equal(initials('Katherine Coleman Goble Johnson'), 'KJ') // first + last only
  assert.equal(initials('Cher'), 'C')
  assert.equal(initials('  '), '')
  assert.equal(initials(null), '')
})

test('the avatar builder collapses to a descriptor with defaults', () => {
  assert.deepEqual(avatar().name('Ada Lovelace').src('/me.png').status('online').build(), {
    block: 'avatar',
    size: 36,
    shape: 'circle',
    src: '/me.png',
    name: 'Ada Lovelace',
    status: 'online',
  })
  assert.equal(avatar().shape('square').build().shape, 'square')
  assert.equal(avatar().shape('hexagon').build().shape, 'circle') // clamps unknown
})

test('avatar resolve derives initials + defaults alt to the name', () => {
  const out = resolvePage(definePage({ sections: [avatar().name('Grace Hopper')] }))
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'avatar')
  assert.equal(r.initials, 'GH')
  assert.equal(r.alt, 'Grace Hopper')
  assert.equal(r.src, null)
  assert.equal(r.size, 36)
})

test('avatarGroup caps the visible avatars and counts the overflow', () => {
  const out = resolvePage(
    definePage({ sections: [avatarGroup([avatar().name('Ada'), avatar().name('Grace'), avatar().name('Katherine'), avatar().name('Linus'), avatar().name('Margaret')]).max(3)] }),
  )
  const r = out.sections[0].resolved
  assert.equal(out.sections[0].block, 'avatarGroup')
  assert.equal(r.avatars.length, 3) // only the visible ones
  assert.equal(r.overflow, 2) // 5 total - 3 shown
  assert.equal(r.avatars[0].resolved.initials, 'A') // resolved recursively (mononym -> one letter)
})

test('avatarGroup with no max shows all, zero overflow', () => {
  const out = resolvePage(definePage({ sections: [avatarGroup([avatar().name('Ada'), avatar().name('Grace')])] }))
  assert.equal(out.sections[0].resolved.avatars.length, 2)
  assert.equal(out.sections[0].resolved.overflow, 0)
})

test('statusColor maps known kinds, passes an unknown value through as a raw color', () => {
  assert.equal(statusColor('online'), '#22c55e')
  assert.equal(statusColor('busy'), '#ef4444')
  assert.equal(statusColor('#123456'), '#123456')
})
