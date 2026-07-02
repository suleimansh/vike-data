// The dep-free markdown parser behind the Markdown renderer. The renderers are JSX/Vue (not
// node:test-tested); this covers the agnostic parse (blocks + inline) that both draw from.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseMarkdown, parseInline } from '../markdown-parse.js'

test('headings parse to level + inline', () => {
  const [b] = parseMarkdown('## Hello')
  assert.equal(b.type, 'heading')
  assert.equal(b.level, 2)
  assert.deepEqual(b.inline, [{ type: 'text', value: 'Hello' }])
})

test('paragraphs are split on blank lines; wrapped lines join', () => {
  const blocks = parseMarkdown('one\ntwo\n\nthree')
  assert.equal(blocks.length, 2)
  assert.equal(blocks[0].type, 'p')
  assert.deepEqual(blocks[0].inline, [{ type: 'text', value: 'one two' }])
  assert.deepEqual(blocks[1].inline, [{ type: 'text', value: 'three' }])
})

test('unordered and ordered lists group consecutive items', () => {
  const ul = parseMarkdown('- a\n- b')[0]
  assert.equal(ul.type, 'ul')
  assert.equal(ul.items.length, 2)
  const ol = parseMarkdown('1. a\n2. b')[0]
  assert.equal(ol.type, 'ol')
  assert.equal(ol.items.length, 2)
})

test('fenced code blocks capture body + lang, not parsed as markdown', () => {
  const b = parseMarkdown('```js\nconst x = **notbold**\n```')[0]
  assert.equal(b.type, 'code')
  assert.equal(b.lang, 'js')
  assert.equal(b.text, 'const x = **notbold**')
})

test('blockquotes and hr', () => {
  assert.equal(parseMarkdown('> quoted')[0].type, 'blockquote')
  assert.equal(parseMarkdown('---')[0].type, 'hr')
})

test('inline: bold / italic / code / link', () => {
  assert.deepEqual(parseInline('a **b** c'), [
    { type: 'text', value: 'a ' },
    { type: 'strong', value: 'b' },
    { type: 'text', value: ' c' },
  ])
  assert.deepEqual(parseInline('`x`'), [{ type: 'code', value: 'x' }])
  assert.deepEqual(parseInline('_it_'), [{ type: 'em', value: 'it' }])
  assert.deepEqual(parseInline('[t](https://e.com)'), [{ type: 'link', href: 'https://e.com', value: 't' }])
})

test('underscore emphasis is word-boundary guarded (snake_case stays plain text)', () => {
  assert.deepEqual(parseInline('call some_helper_fn now'), [{ type: 'text', value: 'call some_helper_fn now' }])
})

test('inline code content is literal (no emphasis inside)', () => {
  const nodes = parseInline('`a_b_c`')
  assert.deepEqual(nodes, [{ type: 'code', value: 'a_b_c' }])
})

test('a full doc parses to the expected block sequence', () => {
  const types = parseMarkdown('# H\n\npara with **bold**\n\n- one\n- two').map((b) => b.type)
  assert.deepEqual(types, ['heading', 'p', 'ul'])
})
