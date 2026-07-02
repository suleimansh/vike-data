// The kbd block: a static keyboard-key leaf (defineBlock) that normalizes a string or array of keys
// into a list of caps. The renderer is not node:test-tested (JSX/Vue), so this covers the agnostic
// builder + resolve plus the shared cap style.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { kbd, definePage, resolvePage, hasBlock } from '../index.js'
import { kbdKeyStyle } from '../kbd-styles.js'

test('kbd is registered', () => {
  assert.ok(hasBlock('kbd'))
})

test('the builder normalizes a string or array of keys', () => {
  assert.deepEqual(kbd('Esc').build(), { block: 'kbd', keys: ['Esc'] }) // single string -> one-key array
  assert.deepEqual(kbd(['Ctrl', 'K']).build(), { block: 'kbd', keys: ['Ctrl', 'K'] })
  assert.deepEqual(kbd().build(), { block: 'kbd', keys: [] }) // nothing -> empty
})

test('resolves as a pass-through section', () => {
  const out = resolvePage(definePage({ sections: [kbd(['Cmd', 'K'])] }))
  assert.equal(out.sections[0].block, 'kbd')
  assert.deepEqual(out.sections[0].resolved, { keys: ['Cmd', 'K'] })
})

test('the cap style is monospace, bordered, and theme-native', () => {
  assert.match(kbdKeyStyle.fontFamily, /monospace/)
  assert.match(kbdKeyStyle.border, /var\(--color-border/)
  assert.match(kbdKeyStyle.background, /var\(--color-surface/)
})
