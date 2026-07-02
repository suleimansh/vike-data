// The text primitives on the shadcn Base typography surface: `text` gains a `.variant()`
// (lead / muted / blockquote / code, default plain), composing with the historical `.tone()`, and a
// new `list` block. The renderers are not node:test-tested (JSX/Vue), so this covers the agnostic
// builders + resolve plus the shared style module (variant/tone resolution) the two renderers share.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { text, list, definePage, resolvePage, hasBlock } from '../index.js'
import { TEXT_VARIANTS, textVariantKey, resolveTextStyle, listStyle } from '../typography-styles.js'

test('text + list are registered', () => {
  assert.ok(hasBlock('text'))
  assert.ok(hasBlock('list'))
})

test('the text builder collapses to a descriptor (variant + back-compat tone)', () => {
  assert.deepEqual(text('Hi').build(), { block: 'text', value: 'Hi' })
  assert.deepEqual(text('Intro').variant('lead').build(), { block: 'text', value: 'Intro', variant: 'lead' })
  assert.deepEqual(text('Careful').tone('danger').build(), { block: 'text', value: 'Careful', tone: 'danger' })
})

test('the list builder collapses to a descriptor (unordered default, .ordered())', () => {
  assert.deepEqual(list(['a', 'b']).build(), { block: 'list', items: ['a', 'b'], ordered: false })
  assert.deepEqual(list(['a']).ordered().build(), { block: 'list', items: ['a'], ordered: true })
  assert.deepEqual(list().build(), { block: 'list', items: [], ordered: false }) // no items -> empty
})

test('both resolve as pass-through sections', () => {
  const out = resolvePage(definePage({ sections: [text('Lead').variant('lead'), list(['x', 'y']).ordered()] }))
  assert.deepEqual(out.sections.map((s) => s.block), ['text', 'list'])
  assert.deepEqual(out.sections[0].resolved, { value: 'Lead', variant: 'lead' })
  assert.deepEqual(out.sections[1].resolved, { items: ['x', 'y'], ordered: true })
})

test('the shadcn Base text variant set is complete', () => {
  assert.deepEqual(Object.keys(TEXT_VARIANTS).sort(), ['blockquote', 'code', 'default', 'lead', 'muted'])
  assert.equal(textVariantKey('lead'), 'lead')
  assert.equal(textVariantKey('nope'), 'default') // unknown -> plain default
  assert.equal(textVariantKey(undefined), 'default')
})

test('resolveTextStyle: default keeps its exact historical color rule', () => {
  assert.equal(resolveTextStyle(undefined, undefined).tag, 'span')
  assert.equal(resolveTextStyle(undefined, undefined).style.color, 'var(--color-text, inherit)')
  assert.equal(resolveTextStyle(undefined, 'danger').style.color, 'var(--color-danger, #dc2626)')
  assert.equal(resolveTextStyle(undefined, 'weird').style.color, 'inherit') // unknown tone -> inherit
})

test('resolveTextStyle: variants use their own element + a known tone overrides the color', () => {
  const bq = resolveTextStyle('blockquote')
  assert.equal(bq.tag, 'blockquote')
  assert.match(bq.style.borderLeft, /var\(--color-border/)

  const code = resolveTextStyle('code')
  assert.equal(code.tag, 'code')
  assert.match(code.style.fontFamily, /monospace/)

  // a known tone overrides a variant's baked-in color; an unknown tone leaves it
  assert.equal(resolveTextStyle('lead', 'success').style.color, 'var(--color-success, #16a34a)')
  assert.equal(resolveTextStyle('lead', 'weird').style.color, TEXT_VARIANTS.lead.style.color)
})

test('listStyle switches the marker between ordered and unordered', () => {
  assert.equal(listStyle(true).listStyleType, 'decimal')
  assert.equal(listStyle(false).listStyleType, 'disc')
})
