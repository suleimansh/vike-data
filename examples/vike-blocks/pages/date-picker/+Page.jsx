// The date-picker block demo. Each picker below is the `date-picker` block rendered through the
// registry (resolvePage + <Blocks>). It's a `calendar` in a popover: click the input-like trigger to
// open the month grid anchored below, pick a day to fill the trigger and close it. `value` is the
// initial selection; `min`/`max` bound the range; `weekStartsOn` picks the first column; `placeholder`
// is the empty-state label. Date submit is the actions axis (#385). The popover machinery (anchor +
// outside-click + Escape) is the dep-free `usePopover` primitive, the light sibling of the modal
// overlay — the same primitive the dropdown-menu and nav-menu blocks will reuse.
import { definePage, resolvePage, datePicker, field } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render one or more block builders through the registry.
const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Row = ({ children }) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '0 0 1.25rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{children}</div>

export default function DatePickerPage() {
  return (
    <div style={{ maxWidth: 620, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Date-picker block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A <code>calendar</code> in a popover. <code>datePicker('2026-07-15').min(...).max(...).placeholder('Due date')</code> — click the trigger to
        open the grid, pick a day to fill it. Outside-click or Escape closes. Colors read vike-themes CSS vars. Date submit is the actions axis (#385).
      </p>

      <Label>Empty (placeholder), opens on click</Label>
      <Row>{Show([datePicker().placeholder('Pick a date')])}</Row>

      <Label>Pre-selected date</Label>
      <Row>{Show([datePicker('2026-07-15')])}</Row>

      <Label>Bounded range + Monday start (days outside 2026-07-06..2026-07-24 are disabled)</Label>
      <Row>{Show([datePicker().value('2026-07-15').min('2026-07-06').max('2026-07-24').weekStartsOn(1)])}</Row>

      <Label>Inside a field</Label>
      <Row>{Show([field('Due date').description('Pick when this is due.').control(datePicker().placeholder('Choose...').name('due'))])}</Row>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
