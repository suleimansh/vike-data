// The textarea block: a from-scratch, theme-native multi-line text input leaf (defineBlock) with
// placeholder / value / rows / name / disabled / required refinements. Display-only (value binding is
// the actions axis #385). The renderer is not node:test-tested (JSX/Vue), so this covers the agnostic
// builder + resolve plus the shared style module (base style + the states style tag).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { textarea, field, definePage, resolvePage, hasBlock } from '../index.js'
import { textareaStyle, TEXTAREA_STYLE_TAG } from '../blocks/textarea-styles.js'

test('textarea is registered', () => {
  assert.ok(hasBlock('textarea'))
})

test('the builder collapses to a plain descriptor', () => {
  assert.deepEqual(textarea().build(), { block: 'textarea' })
  assert.deepEqual(textarea().placeholder('Write a bio...').rows(5).build(), { block: 'textarea', placeholder: 'Write a bio...', rows: 5 })
  assert.deepEqual(textarea().value('Draft').disabled().build(), { block: 'textarea', value: 'Draft', disabled: true })
  assert.deepEqual(textarea().name('bio').required().build(), { block: 'textarea', name: 'bio', required: true })
})

test('resolves as a pass-through section', () => {
  const out = resolvePage(definePage({ sections: [textarea().placeholder('Notes').rows(4)] }))
  assert.equal(out.sections[0].block, 'textarea')
  assert.deepEqual(out.sections[0].resolved, { placeholder: 'Notes', rows: 4 })
})

test('composes as a field control (the field wraps a textarea)', () => {
  const out = resolvePage(definePage({ sections: [field('Bio').control(textarea().rows(4))] }))
  assert.equal(out.sections[0].resolved.control.block, 'textarea')
  assert.deepEqual(out.sections[0].resolved.control.resolved, { rows: 4 })
})

test('textareaStyle is full-width, resizable, and sets the disabled cursor', () => {
  const s = textareaStyle(false)
  assert.equal(s.width, '100%')
  assert.equal(s.resize, 'vertical')
  assert.equal(s.cursor, 'text')
  assert.match(s.minHeight, /rem/)
  assert.match(s.border, /var\(--color-border/)
  assert.equal(textareaStyle(true).cursor, 'default') // disabled
})

test('the states style tag covers placeholder, focus-visible ring and disabled', () => {
  assert.match(TEXTAREA_STYLE_TAG, /::placeholder\{color:var\(--color-muted/)
  assert.match(TEXTAREA_STYLE_TAG, /:focus-visible\{[^}]*box-shadow/)
  assert.match(TEXTAREA_STYLE_TAG, /:disabled\{[^}]*opacity:\.5/)
})
