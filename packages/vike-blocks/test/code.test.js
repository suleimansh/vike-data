// The code block: a snippet with a filename header, copy, line numbers, and per-line decorations. The
// renderers are JSX/Vue (not node:test-tested), so this covers the agnostic builder, the marker parser,
// the generic tokenizer, and the resolve view-model.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { code, definePage, resolvePage, getBlock, hasBlock } from '../index.js'
import { tokenizeLines, parseMarkers, TOKEN_COLORS } from '../blocks/code-highlight.js'

const resolveCode = (builder) => getBlock('code').resolve({ props: builder.build() })

test('code is registered', () => {
  assert.ok(hasBlock('code'))
})

test('the builder collapses to a { block, ...props } descriptor', () => {
  const d = code('const x = 1').lang('ts').filename('a.ts').build()
  assert.equal(d.block, 'code')
  assert.equal(d.code, 'const x = 1')
  assert.equal(d.lang, 'ts')
  assert.equal(d.filename, 'a.ts')
})

test('line numbers and copy default on; noCopy / lineNumbers(false) turn them off', () => {
  assert.equal(resolveCode(code('x')).lineNumbers, true)
  assert.equal(resolveCode(code('x')).copy, true)
  assert.equal(resolveCode(code('x').lineNumbers(false)).lineNumbers, false)
  assert.equal(resolveCode(code('x').noCopy()).copy, false)
})

test('resolve yields one line per source line, aligned', () => {
  const out = resolveCode(code('a\nb\nc'))
  assert.equal(out.lines.length, 3)
})

test('a trailing newline does not add a phantom line, and the clipboard payload is trimmed', () => {
  const out = resolveCode(code('a\nb\n'))
  assert.equal(out.lines.length, 2)
  assert.equal(out.code, 'a\nb')
})

test('explicit highlight / add / remove / focus arrays decorate the right 1-based lines', () => {
  const out = resolveCode(code('l1\nl2\nl3\nl4').highlight([1]).add(2).remove([3]).focus([4]))
  assert.equal(out.lines[0].hl, true)
  assert.equal(out.lines[1].diff, 'add')
  assert.equal(out.lines[2].diff, 'remove')
  assert.equal(out.lines[3].focus, true)
  assert.equal(out.hasFocus, true)
})

test('inline kibo markers decorate lines and are stripped from the code', () => {
  const src = ['const a = 1 // [!code highlight]', 'const b = 2 // [!code ++]', 'const c = 3 // [!code --]', 'const d = 4 // [!code focus]'].join('\n')
  const { clean, flags } = parseMarkers(src)
  assert.ok(!clean.includes('[!code'))
  assert.equal(flags[0].hl, true)
  assert.equal(flags[1].diff, 'add')
  assert.equal(flags[2].diff, 'remove')
  assert.equal(flags[3].focus, true)
  // and the full resolve path picks them up + reports focus mode
  const out = getBlock('code').resolve({ props: { code: src } })
  assert.equal(out.lines[0].hl, true)
  assert.equal(out.lines[1].diff, 'add')
  assert.equal(out.hasFocus, true)
})

test('the tokenizer classifies comments, strings, keywords, and numbers', () => {
  const [line] = tokenizeLines('const n = 42 // note', 'js')
  const kw = line.find((t) => t.t === 'const')
  const num = line.find((t) => t.t === '42')
  const comment = line.find((t) => t.c === 'comment')
  assert.equal(kw.c, 'keyword')
  assert.equal(num.c, 'number')
  assert.ok(comment && comment.t.includes('note'))
})

test('the tokenizer keeps a multi-line string colored across lines', () => {
  const lines = tokenizeLines('const s = `a\nb`', 'ts')
  assert.equal(lines.length, 2)
  assert.ok(lines[0].some((t) => t.c === 'string'))
  assert.ok(lines[1].some((t) => t.c === 'string')) // second line still inside the template
})

test('# is a comment only for hash-comment languages', () => {
  assert.ok(tokenizeLines('# a shell comment', 'bash')[0].some((t) => t.c === 'comment'))
  assert.ok(!tokenizeLines('const x = obj.#priv', 'ts')[0].some((t) => t.c === 'comment'))
})

test('plain() renders one plain token per line, no tokenizing', () => {
  const out = resolveCode(code('const x = 1').plain())
  assert.equal(out.lines[0].tokens.length, 1)
  assert.equal(out.lines[0].tokens[0].c, 'plain')
})

test('token colors are theme-native (read a CSS var)', () => {
  assert.match(TOKEN_COLORS.keyword, /var\(--color-code-keyword/)
  assert.match(TOKEN_COLORS.plain, /var\(--color-/)
})

test('resolves as a section through a page', () => {
  const out = resolvePage(definePage({ sections: [code('hi').filename('h.txt')] }))
  assert.equal(out.sections[0].block, 'code')
  assert.equal(out.sections[0].resolved.filename, 'h.txt')
})
