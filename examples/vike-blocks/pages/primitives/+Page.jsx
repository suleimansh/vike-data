// The leaf primitives + a custom block, composed with fluent builders. `definePage({ sections })`
// composes a page out of blocks; each section is a builder whose `.build()` collapses to a
// descriptor. `<Page>` resolves the page and draws each block with its registered renderer —
// importing ./callout.block registers the custom one alongside the built-ins.
import { definePage, resolvePage, heading, text, badge, divider, link } from 'vike-blocks'
import { Page, Blocks } from 'vike-blocks/react'
import { callout } from '../callout.block.jsx'

const page = definePage({
  sections: [
    heading('Primitives').level(1),
    text('A page is a composition of BLOCKS — a UI schema, separate from any data schema. These are the built-in leaf primitives; the boxes below are a custom block defined in this app.').tone('muted'),
    badge('primitives').tone('info'),
    divider(),
    callout('What is a block?')
      .tone('info')
      .body('A { block: "type", ...props } descriptor. definePage composes them into a page; a per-framework renderer draws each one. No layout DSL — just typed sections.'),
    callout('Custom blocks are peers')
      .tone('warn')
      .body('The callout is not built in — it was created with defineBlock() + registerBlockRenderer() in ./callout.block.jsx. Your block composes exactly like heading/text/badge.'),
    divider(),
    text('The same page can also be authored as plain { block, ...props } descriptors:').tone('muted'),
    link('See the plain-descriptor version ->').to('/raw'),
  ],
})

// The badge block on the shadcn Base surface, shown side by side: the .variant() surfaces and the
// back-compat .tone() soft tints. Rendered straight through the registry like the button demo.
const badgeRow = (sections) => <Blocks sections={resolvePage(definePage({ sections })).sections} />
const Row = ({ children }) => <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', margin: '0.3rem 0 1.2rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{children}</div>

export default function PrimitivesPage() {
  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <Page page={page} />

      <div style={{ marginTop: '1.5rem' }}>
        <Label>Badge — shadcn Base variants</Label>
        <Row>
          {badgeRow([badge('Default').variant('default'), badge('Secondary').variant('secondary'), badge('Destructive').variant('destructive'), badge('Outline').variant('outline')])}
        </Row>
        <Label>Badge — semantic .tone() (back-compat soft tints)</Label>
        <Row>
          {badgeRow([badge('info').tone('info'), badge('success').tone('success'), badge('warning').tone('warning'), badge('danger').tone('danger'), badge('muted').tone('muted')])}
        </Row>
      </div>

      <p style={{ marginTop: '1.5rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
