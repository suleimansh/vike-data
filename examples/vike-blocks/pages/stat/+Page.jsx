// The `stat` block — a KPI / metric tile (title + value). It ships as a bespoke pass-through block,
// so there is no fluent builder: a stat is the plain descriptor `{ block: 'stat', title, value }`,
// which is exactly what a dashboard query would emit. Here we lay a row of them out in a grid, then
// show one composed inside a card. `resolvePage` turns the descriptors into view-models and
// `<Blocks>` draws each with its registered renderer.
import { resolvePage, definePage, heading, text, card } from 'vike-blocks'
import { Page, Blocks } from 'vike-blocks/react'

// A dashboard row: four KPI tiles, authored as data. `value` is pre-formatted (the renderer draws
// it verbatim), so a real app formats numbers/currency before handing them to the block.
const kpis = [
  { block: 'stat', title: 'Revenue', value: '$48.2k' },
  { block: 'stat', title: 'Orders', value: '1,284' },
  { block: 'stat', title: 'New customers', value: '312' },
  { block: 'stat', title: 'Refund rate', value: '1.8%' },
]

// A stat with no value falls back to an em dash — the empty/loading state.
const loading = [{ block: 'stat', title: 'Pending payouts' }]

// Stats compose inside any container. A card wraps a titled stat here.
const inCard = definePage({
  sections: [card([{ block: 'stat', title: 'Active sessions', value: '5,910' }]).title('Live')],
})

const intro = definePage({
  sections: [
    heading('Stat').level(1),
    text('A KPI / metric tile — a title over a single value. A bespoke block (no builder): the descriptor is `{ block: "stat", title, value }`, the shape a dashboard query emits. Compose several in a grid for a metrics row.').tone('muted'),
  ],
})

const Grid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.9rem', margin: '1.25rem 0' }}>{children}</div>
)
const Label = ({ children }) => <div style={{ fontSize: 13, color: 'var(--color-muted)', margin: '1.5rem 0 0.5rem' }}>{children}</div>

export default function StatPage() {
  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif', color: 'var(--color-text)' }}>
      <Page page={intro} />

      <Label>A metrics row</Label>
      <Grid>
        <Blocks sections={resolvePage({ sections: kpis }).sections} />
      </Grid>

      <Label>Empty / loading (no value)</Label>
      <div style={{ maxWidth: 200 }}>
        <Blocks sections={resolvePage({ sections: loading }).sections} />
      </div>

      <Label>Composed inside a card</Label>
      <div style={{ maxWidth: 260 }}>
        <Page page={inCard} />
      </div>

      <p style={{ marginTop: '1.75rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
