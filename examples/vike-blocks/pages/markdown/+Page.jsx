// The `markdown` block — a leaf that renders a markdown source string. The built-in renderer is an
// MVP: it prints the source verbatim (whitespace preserved), zero deps. A real app swaps in a
// markdown renderer with `registerBlockRenderer('markdown', ...)` — the block type stays 'markdown',
// so pages don't change. Authored with the `markdown(source)` builder.
import { definePage, heading, text, card, markdown } from 'vike-blocks'
import { Page } from 'vike-blocks/react'

const source = `# Release notes

Ship UI as **data**, not JSX.

- A page is a list of block descriptors
- Each block has a per-framework renderer
- \`markdown\` is one leaf among them

> Swap the built-in renderer for a real one via registerBlockRenderer.`

const page = definePage({
  sections: [
    heading('Markdown').level(1),
    text('A leaf block for a markdown source string. The built-in renderer is an MVP that prints the source verbatim; register a real markdown renderer to get formatted output. Handy for AI/chat bodies and long-form copy inside a block page.').tone('muted'),

    heading('Built-in renderer (MVP)').level(2),
    text('The source below is rendered by the default pass-through renderer — the raw markdown, whitespace preserved:').tone('muted'),
    card([markdown(source)]),

    heading('Composed anywhere').level(2),
    text('A markdown block composes inside any container, the same as text or heading.').tone('muted'),
    card([markdown('Inline **markdown** inside a card. See the `bubble` and `message` demos for markdown bodies in a chat UI.')]).title('In a card'),
  ],
})

export default function MarkdownPage() {
  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif', color: 'var(--color-text)' }}>
      <Page page={page} />
      <p style={{ marginTop: '1.75rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
