// The `code` block — a code snippet with a filename header, a copy button, line numbers, and per-line
// decorations (highlight / diff / focus). Source: kibo-ui's code-block, reimplemented dep-free (its
// Shiki highlighter is replaced by the small generic tokenizer in code-highlight.js), theme-native,
// and cross-framework. Interactivity is just the copy button's local state (like tabs / toast), so it
// needs no actions layer.
//
//   code("const x = 1\nconsole.log(x)").lang('ts').filename('demo.ts')
//   code(src).lang('tsx').highlight([2]).add([3]).remove([4])   // explicit line decorations
//   code(src).focus([2, 3])                                     // dim every other line
//   code(src).lineNumbers(false).noCopy().plain()               // bare, no tokenizing
//
// Decorations can also ride inline in the source as kibo markers (stripped on resolve):
//   const y = 2 // [!code highlight]
//   added()     // [!code ++]
//   removed()   // [!code --]
//   focused()   // [!code focus]
//
// Multiple files? Compose with the `tabs` block, one code per tab.
import { defineBlock } from '../core/registry.js'
import { tokenizeLines, parseMarkers } from './code-highlight.js'

const toLineArray = (v) => (Array.isArray(v) ? v : v != null ? [v] : [])

export const code = defineBlock('code', {
  category: 'content',
  summary: "A syntax-highlighted code block.",
  example: "code('const x = 1').lang('ts').filename('demo.ts')",
  build: (code) => ({ code: code ?? '' }),
  refine: {
    lang: (l) => ({ lang: l }),
    filename: (f) => ({ filename: f }),
    lineNumbers: (on = true) => ({ lineNumbers: on }),
    highlight: (lines) => ({ highlight: toLineArray(lines) }),
    add: (lines) => ({ add: toLineArray(lines) }),
    remove: (lines) => ({ remove: toLineArray(lines) }),
    focus: (lines) => ({ focus: toLineArray(lines) }),
    noCopy: () => ({ copy: false }),
    plain: () => ({ plain: true }),
  },
  // Turn the descriptor into a serializable view-model: strip inline markers, merge the explicit
  // decoration arrays, tokenize each line, and keep the clean source for the clipboard. All plain
  // data (no functions), so it serializes to the client and both renderers stay thin.
  resolve({ props }) {
    const { clean, flags } = parseMarkers(props.code)

    // Explicit 1-based line arrays layer on top of any inline markers.
    for (const no of toLineArray(props.highlight)) if (flags[no - 1]) flags[no - 1].hl = true
    for (const no of toLineArray(props.add)) if (flags[no - 1]) flags[no - 1].diff = 'add'
    for (const no of toLineArray(props.remove)) if (flags[no - 1]) flags[no - 1].diff = 'remove'
    for (const no of toLineArray(props.focus)) if (flags[no - 1]) flags[no - 1].focus = true

    const tokLines = props.plain ? clean.split('\n').map((l) => (l ? [{ t: l, c: 'plain' }] : [])) : tokenizeLines(clean, props.lang)

    const lines = tokLines.map((tokens, idx) => ({
      tokens,
      hl: flags[idx]?.hl ?? false,
      diff: flags[idx]?.diff ?? null,
      focus: flags[idx]?.focus ?? false,
    }))
    // A trailing newline in the source yields a phantom empty last line — drop it so line numbers
    // match the visible code.
    if (clean.endsWith('\n') && lines.length > 1 && lines[lines.length - 1].tokens.length === 0) lines.pop()

    return {
      filename: props.filename ?? null,
      lang: props.lang ?? null,
      lineNumbers: props.lineNumbers !== false, // default on
      copy: props.copy !== false, // default on
      code: clean.replace(/\n$/, ''), // clipboard payload, without the phantom trailing newline
      hasFocus: flags.some((f) => f.focus),
      lines,
    }
  },
})
