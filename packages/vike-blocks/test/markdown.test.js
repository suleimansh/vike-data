// The markdown block: a leaf that renders a markdown source string. Now has a fluent builder (via
// defineBlock) so it reads like the other leaves instead of a raw { block, source } descriptor. The
// renderer is JSX/Vue (not node:test-tested); this covers the agnostic builder + registration.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { markdown, definePage, resolvePage, hasBlock } from '../index.js'

test('markdown is registered', () => {
  assert.ok(hasBlock('markdown'))
})

test('the builder collapses to a { block, source } descriptor', () => {
  assert.deepEqual(markdown('# Hi').build(), { block: 'markdown', source: '# Hi' })
  assert.deepEqual(markdown().build(), { block: 'markdown', source: '' }) // nothing -> empty source
})

test('resolves as a pass-through section (source echoed)', () => {
  const out = resolvePage(definePage({ sections: [markdown('**bold**')] }))
  assert.equal(out.sections[0].block, 'markdown')
  assert.deepEqual(out.sections[0].resolved, { source: '**bold**' })
})

test('a raw { block: markdown } descriptor still resolves (builder is sugar, not required)', () => {
  const out = resolvePage(definePage({ sections: [{ block: 'markdown', source: 'x' }] }))
  assert.deepEqual(out.sections[0].resolved, { source: 'x' })
})
