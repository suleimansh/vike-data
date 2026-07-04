// The collapsible block: a single expand/collapse disclosure, the single-panel sibling of the
// accordion. `collapsible(label, [blocks])` toggles one panel of nested blocks; .open() starts it
// expanded. Open/closed is local UI state; the panel height morphs (measured, CSS-transitioned) and
// fades — no animation library, same in React and Vue. Colors/radius read vike-themes CSS vars.
import { definePage, collapsible, heading, text, badge } from 'vike-blocks'
import { Page } from 'vike-blocks/react'

const page = definePage({
  sections: [
    heading('Collapsible block').level(1),
    text('A single expand/collapse disclosure — one trigger reveals one panel of nested blocks. The single-panel sibling of the accordion, with the same animated height morph.').tone('muted'),

    heading('Closed by default').level(3),
    collapsible('What is a block?', [
      text('A block is one section of a page — a { block, ...props } descriptor. A container block (accordion, collapsible) holds nested blocks, resolved recursively.'),
      badge('theme-native').tone('info'),
    ]),
    collapsible('How does it animate without a library?', [
      text('The panel measures its natural height, then CSS-transitions between 0 and that height while fading in. The same zero-dependency technique the accordion and tabs blocks use.'),
    ]),

    heading('Open by default').level(3),
    text('Call .open() to start expanded.').tone('muted'),
    collapsible('Shipping details', [
      text('Ships in 2-3 business days. Free returns within 30 days.'),
    ]).open(),
  ],
})

export default function CollapsiblePage() {
  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <Page page={page} />
      <p style={{ marginTop: '1.5rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
