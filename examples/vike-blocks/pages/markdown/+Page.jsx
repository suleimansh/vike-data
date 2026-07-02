// The markdown block demo. A leaf that carries a markdown source string. `markdown(src)` reads like
// text()/heading()/code(); a raw { block: 'markdown', source } works too. The built-in renderer is
// dep-free (a small parser: headings / lists / emphasis / code / links / quotes); for tables / GFM /
// footnotes an app swaps a real one in with registerBlockRenderer('markdown', ...). This page renders
// live markdown and shows the swap.
import { definePage, markdown, heading, text, code } from 'vike-blocks'
import { Page } from 'vike-blocks/react'

const sample = `# Heading

Some **bold** and _italic_ copy, plus \`inline code\` and a [link](https://vike.dev).

- one
- two
- three

> A blockquote, for good measure.`

const swap = `import { registerBlockRenderer } from 'vike-blocks/react'
import { marked } from 'marked' // or any engine you like

function Markdown({ source }) {
  return <div dangerouslySetInnerHTML={{ __html: marked(source) }} />
}

// override the built-in: every markdown() on every page now renders through this
registerBlockRenderer('markdown', Markdown)`

const page = definePage({
  sections: [
    heading('Markdown block').level(1),
    text('A leaf that carries a markdown source string. markdown(src) reads like text() / heading() / code(); a raw { block: "markdown", source } descriptor works too.').tone('muted'),

    heading('Built-in renderer (dep-free)').level(3),
    text('The built-in renderer parses a common markdown subset (headings, lists, bold / italic, inline + fenced code, links, quotes) with zero dependencies. Live below:'),
    markdown(sample),

    heading('Swap in a fuller engine').level(3),
    text('Need tables, GFM, footnotes? Register your own renderer for the markdown block and every markdown() everywhere renders through it (this snippet is itself a code block):'),
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
