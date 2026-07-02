// The chart block demo. Each chart below is the `chart` block rendered through the registry
// (resolvePage + <Blocks>). A dep-free, theme-native SVG chart for the common cases — bar, line, area —
// driven by a single data series of { label, value } (or bare numbers). `.type()` picks the form,
// `.height()` sizes it, `.color()` sets the accent, `.max()` fixes the scale. The vertical axis is
// pixel-accurate and the plot stretches to its container. Rich/interactive charts stay a `custom` block
// that plugs in a charting library. Colors read vike-themes CSS vars.
import { definePage, resolvePage, chart, card } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{children}</div>

const week = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 18 },
  { label: 'Wed', value: 9 },
  { label: 'Thu', value: 22 },
  { label: 'Fri', value: 27 },
  { label: 'Sat', value: 14 },
  { label: 'Sun', value: 6 },
]

export default function ChartPage() {
  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Chart block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A dep-free, theme-native SVG chart for the common cases. <code>chart(data).type('bar' | 'line' | 'area').height(...).color(...)</code> — a
        single series of <code>{'{ label, value }'}</code> or bare numbers. Hover a bar/point for its value. Rich/interactive charts stay a{' '}
        <code>custom</code> block that plugs in a charting library.
      </p>

      <Label>Bar (this week)</Label>
      {Show([chart(week).height(180)])}

      <div style={{ height: '1.25rem' }} />
      <Label>Line</Label>
      {Show([chart(week).type('line').height(180).color('var(--color-success, #16a34a)')])}

      <div style={{ height: '1.25rem' }} />
      <Label>Area</Label>
      {Show([chart([4, 8, 15, 16, 23, 42, 30, 38]).type('area').height(180)])}

      <div style={{ height: '1.5rem' }} />
      <Label>Composed inside a card</Label>
      {Show([card([chart(week).type('bar').height(140)]).title('Signups').description('New accounts per day')])}

      <p style={{ marginTop: '1.25rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
