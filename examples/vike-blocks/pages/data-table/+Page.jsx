// The data-table block demo. The plain `table` upgraded into a data table: a global search filter, row
// selection (a checkbox column + select-all), and column-visibility controls, all on top of the same
// non-schema rows + columns. Each feature is opt-in (.filter() / .selectable() / .columnToggle() /
// .sortable()). It reuses the table chrome, so it themes identically, and stays the plain-data
// counterpart to vike-crud's schema-driven list. Rendered through the registry (resolvePage + <Blocks>).
import { definePage, resolvePage, dataTable } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Label = ({ children }) => <div style={{ fontSize: 13, color: 'var(--color-muted)', margin: '1.75rem 0 0.6rem' }}>{children}</div>

// A day-offset ISO date so the `since` formatter shows a relative time.
const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

const people = [
  { name: 'Ada Lovelace', role: 'Admin', joined: daysAgo(2), active: true },
  { name: 'Grace Hopper', role: 'Editor', joined: daysAgo(9), active: true },
  { name: 'Alan Turing', role: 'Viewer', joined: daysAgo(40), active: false },
  { name: 'Katherine Johnson', role: 'Editor', joined: daysAgo(120), active: true },
  { name: 'Edsger Dijkstra', role: 'Viewer', joined: daysAgo(400), active: false },
]

const columns = ['name', 'role', { key: 'joined', label: 'Joined', format: 'since' }, { key: 'active', label: 'Active', align: 'center' }]

export default function DataTablePage() {
  return (
    <div style={{ maxWidth: 760, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif', color: 'var(--color-text)' }}>
      <h1 style={{ marginTop: 0 }}>Data-table block</h1>
      <p style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
        The plain <a href="/table">table</a> upgraded into a data table — a search filter, row selection (a checkbox
        column + select-all), and column-visibility controls, each opt-in.{' '}
        <code>dataTable({'{'} columns, rows {'}'}).sortable().filter().selectable().columnToggle()</code>. It reuses the
        table chrome, so it themes identically, and stays the plain-data counterpart to the schema-driven list. The
        selection binding is the actions axis (#385).
      </p>

      <Label>The full data table (sort + filter + selection + columns menu)</Label>
      {Show([dataTable({ columns, rows: people }).sortable().filter('Search people...').selectable().columnToggle()])}

      <Label>Filter + sort only</Label>
      {Show([dataTable({ columns, rows: people }).sortable().filter()])}

      <Label>Row selection only</Label>
      {Show([dataTable({ columns: ['name', 'role'], rows: people }).selectable()])}

      <p style={{ marginTop: '1.75rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
