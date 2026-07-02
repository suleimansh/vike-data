// The table block: a non-schema data table — feed it rows + columns directly (API results,
// computed data) and it renders a themed table. The plain-data counterpart to vike-view's
// schema-driven list; it shares the ListView chrome without the schema path. Sorting is local
// client state (no actions layer). Display-only — the interactive non-schema form waits on #385.
import { definePage, table, heading, text } from 'vike-blocks'
import { Page } from 'vike-blocks/react'

const members = [
  { name: 'Ada Lovelace', role: 'Admin', joined: '2026-04-02T10:00:00Z', active: true },
  { name: 'Bo Turing', role: 'Member', joined: '2026-06-20T10:00:00Z', active: true },
  { name: 'Cy Hopper', role: 'Member', joined: '2026-06-30T10:00:00Z', active: false },
]

const revenue = [
  { region: 'EMEA', deals: 42, mrr: 18400 },
  { region: 'AMER', deals: 71, mrr: 31200 },
  { region: 'APAC', deals: 30, mrr: 12750 },
]

const page = definePage({
  sections: [
    heading('Table block').level(1),
    text('A non-schema data table: feed it rows + columns directly and it draws a themed table. The plain-data counterpart to the schema-driven list — same chrome, no schema. Dep-free, theme-native.').tone('muted'),

    heading('Basic').level(3),
    text('String columns; labels are humanized from the row key.'),
    table({ columns: ['name', 'role'], rows: members }),

    heading('Formatted columns + sortable').level(3),
    text('Object columns set label / align / format. `since` renders a relative time, booleans read yes/no. Click a header to sort.'),
    table({
      columns: ['name', { key: 'joined', format: 'since' }, { key: 'active', label: 'Active' }],
      rows: members,
    }).sortable(),

    heading('Right-aligned numbers').level(3),
    table({
      columns: ['region', { key: 'deals', align: 'right' }, { key: 'mrr', label: 'MRR', align: 'right' }],
      rows: revenue,
    }).sortable(),

    heading('Empty state').level(3),
    table({ columns: ['name', 'role'], rows: [] }).empty('No members yet'),
  ],
})

export default function TablePage() {
  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <Page page={page} />
      <p style={{ marginTop: '1.5rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
