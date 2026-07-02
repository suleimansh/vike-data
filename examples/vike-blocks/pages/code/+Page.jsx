// The code block: a snippet with a filename header, a copy button, line numbers, and per-line
// decorations. Source = kibo-ui's code-block, reimplemented dep-free (a small generic tokenizer, no
// Shiki), theme-native, and cross-framework. The copy button is the only client state.
import { definePage, codeBlock, heading, text } from 'vike-blocks'
import { Page } from 'vike-blocks/react'

const snippet = `import { defineView, crudBlocks } from 'vike-view'

// a schema-driven CRUD page in ~10 lines
export default defineView({
  route: '/posts',
  sections: crudBlocks({ table: 'posts' }),
  scope: (t, ctx) => ({ author_id: ctx.user.id }),
})`

const diff = `function total(items) {
  let sum = 0
  for (const i of items) sum += i.price // [!code --]
  return items.reduce((s, i) => s + i.price, 0) // [!code ++]
}`

const page = definePage({
  sections: [
    heading('Code block').level(1),
    text('A themed code surface: filename header, copy button, line numbers, and per-line decorations. Dep-free — a small generic tokenizer stands in for Shiki; colors read vike-themes CSS vars.').tone('muted'),

    heading('Basic').level(3),
    codeBlock(snippet).lang('tsx').filename('pages/posts/+view.js'),

    heading('Highlighted + focused lines').level(3),
    text('Mark lines explicitly with .highlight()/.focus(), or inline with kibo-style // [!code ...] markers.'),
    codeBlock(snippet).lang('tsx').highlight([4]).focus([4, 5, 6, 7]),

    heading('Diff').level(3),
    text('Inline markers drive an add/remove diff:'),
    codeBlock(diff).lang('js').filename('total.js'),

    heading('Bare (no chrome)').level(3),
    codeBlock("echo 'no header, no line numbers, no copy'").lang('bash').lineNumbers(false).noCopy(),
  ],
})

export default function CodePage() {
  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <Page page={page} />
      <p style={{ marginTop: '1.5rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
