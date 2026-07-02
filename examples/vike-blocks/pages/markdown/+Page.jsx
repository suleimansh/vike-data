// The markdown block demo. A leaf that carries a markdown source string. `markdown(src)` reads like
// text()/heading()/code(); a raw { block: 'markdown', source } works too. The built-in renderer is a
// zero-dep MVP (the source as pre-wrapped text, no parsing) - an app swaps a real one in with
// registerBlockRenderer('markdown', ...). This page shows both the default output and the swap.
import { definePage, markdown, heading, text, code } from 'vike-blocks'
import { Page } from 'vike-blocks/react'

const sample = `# Heading

Some **bold** and _italic_ copy, plus \`inline code\`.

- one
- two`

const swap = `import { registerBlockRenderer } from 'vike-blocks/react'
import { marked } from 'marked' // or any renderer you like

function Markdown({ source }) {
  return <div dangerouslySetInnerHTML={{ __html: marked(source) }} />
}

// override the MVP: every markdown() on every page now renders through this
registerBlockRenderer('markdown', Markdown)`

const page = definePage({
  sections: [
    heading('Markdown block').level(1),
    text('A leaf that carries a markdown source string. markdown(src) reads like text() / heading() / code(); a raw { block: "markdown", source } descriptor works too.').tone('muted'),

    heading('Default renderer (zero-dep MVP)').level(3),
    text('The built-in renderer prints the source as pre-wrapped text: no parsing, no dependency. Enough to carry copy, not a full markdown engine. So the sample below shows verbatim, not rendered:'),
    markdown(sample),

    heading('Swap in a real renderer').level(3),
    text('Register your own renderer for the markdown block and every markdown() everywhere renders through it (this snippet is itself a code block):'),
    code(swap).lang('jsx').filename('bootstrap.jsx'),
  ],
})

export default function MarkdownPage() {
  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <Page page={page} />
      <p style={{ marginTop: '1.5rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
