// The input block: a from-scratch, theme-native single-line text input leaf (defineBlock) with
// type / placeholder / value / name / disabled / required refinements. Display-only (value binding
// is the actions axis #385). The renderer is not node:test-tested (JSX/Vue), so this covers the
// agnostic builder + resolve plus the shared style module (base style + the states style tag).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { input, definePage, resolvePage, hasBlock } from '../index.js'
import { inputStyle, INPUT_STYLE_TAG } from '../input-styles.js'

test('input is registered', () => {
  assert.ok(hasBlock('input'))
})

test('the builder collapses to a plain descriptor (text by default)', () => {
  assert.deepEqual(input().build(), { block: 'input', type: 'text' })
  assert.deepEqual(input().type('email').placeholder('you@example.com').build(), {
    block: 'input',
    type: 'email',
    placeholder: 'you@example.com',
  })
  assert.deepEqual(input().value('draft').disabled().build(), { block: 'input', type: 'text', value: 'draft', disabled: true })
  assert.deepEqual(input().type('password').name('password').required().build(), {
    block: 'input',
    type: 'password',
    name: 'password',
    required: true,
  })
})

test('resolves as a pass-through section', () => {
  const out = resolvePage(definePage({ sections: [input().type('search').placeholder('Search')] }))
  assert.equal(out.sections[0].block, 'input')
  assert.deepEqual(out.sections[0].resolved, { type: 'search', placeholder: 'Search' })
})

test('inputStyle is full-width, bordered, and sets the disabled cursor', () => {
  const s = inputStyle(false)
  assert.equal(s.width, '100%')
  assert.equal(s.cursor, 'text')
  assert.match(s.border, /var\(--color-border/)
  assert.match(s.borderRadius, /var\(--radius/)
  assert.equal(inputStyle(true).cursor, 'default') // disabled
})

test('the states style tag covers placeholder, focus-visible ring and disabled', () => {
  assert.match(INPUT_STYLE_TAG, /::placeholder\{color:var\(--color-muted/)
  assert.match(INPUT_STYLE_TAG, /:focus-visible\{[^}]*box-shadow/)
  assert.match(INPUT_STYLE_TAG, /:disabled\{[^}]*opacity:\.5/)
})
