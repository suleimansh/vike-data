// The calendar block demo. Each calendar below is the `calendar` block rendered through the registry
// (resolvePage + <Blocks>). A dep-free, theme-native month grid — step months with the arrows, click a
// day to select it. `value` is the initial selection; `min`/`max` bound the range; `weekStartsOn` picks
// the first column. Date submit is the actions axis (#385). A calendar composes inside a `field` (#426)
// and is what `date-picker` drops into a popover.
import { definePage, resolvePage, calendar, field } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render one or more block builders through the registry.
const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Row = ({ children }) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '0 0 1.25rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{children}</div>

export default function CalendarPage() {
  return (
    <div style={{ maxWidth: 620, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Calendar block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A dep-free, theme-native month grid (no date library). <code>calendar('2026-07-15').min(...).max(...).weekStartsOn(1)</code> — step months
        with the arrows, click a day to select it. Colors read vike-themes CSS vars. Date submit is the actions axis (#385).
      </p>

      <Label>A selected date (Sunday start)</Label>
      <Row>{Show([calendar('2026-07-15')])}</Row>

      <Label>Bounded range + Monday start (days outside 2026-07-06..2026-07-24 are disabled)</Label>
      <Row>{Show([calendar().value('2026-07-15').min('2026-07-06').max('2026-07-24').weekStartsOn(1)])}</Row>

      <Label>Inside a field</Label>
      <Row>{Show([field('Due date').description('Pick when this is due.').control(calendar().value('2026-07-04'))])}</Row>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
