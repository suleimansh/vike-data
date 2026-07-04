// The toggle-button + toggle-group demo. Each control is rendered through the registry (resolvePage +
// <Blocks>). A `toggleButton` is a single pressable on/off button (aria-pressed); a `toggleGroup` is a
// segmented control of connected buttons — single-select (click again to clear) or `.multiple()` for a
// toolbar where several can be pressed at once. Distinct from the switch block, which is a form boolean
// with a sliding thumb. The pressed state is local UI state (value binding is the actions axis #385).
import { definePage, resolvePage, toggleButton, toggleGroup } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Row = ({ children }) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', margin: '0 0 1.5rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: 'var(--color-muted)', margin: '0 0 0.55rem' }}>{children}</div>

export default function TogglePage() {
  return (
    <div style={{ maxWidth: 620, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif', color: 'var(--color-text)' }}>
      <h1 style={{ marginTop: 0 }}>Toggle + toggle-group block</h1>
      <p style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
        A pressable on/off button and a segmented control — the toolbar / segmented-select staple.{' '}
        <code>toggleButton('Bold').pressed()</code> and <code>toggleGroup().item(v, label).value(v).multiple()</code>.
        Distinct from the <a href="/switch">switch</a>, which is a form boolean. The pressed state is local; value
        binding is the actions axis (#385).
      </p>

      <Label>A single toggle button (initially pressed)</Label>
      <Row>{Show([toggleButton('Bold').pressed()])}</Row>

      <Label>Single-select segmented control (a view switcher)</Label>
      <Row>{Show([toggleGroup().item('list', 'List').item('grid', 'Grid').item('board', 'Board').value('list')])}</Row>

      <Label>Multi-select (a formatting toolbar — several can be on)</Label>
      <Row>{Show([toggleGroup().item('b', 'B').item('i', 'I').item('u', 'U').multiple().value(['b'])])}</Row>

      <Label>Standalone toggle buttons in a row</Label>
      <Row>
        {Show([toggleButton('Align left').pressed()])}
        {Show([toggleButton('Align center')])}
        {Show([toggleButton('Align right')])}
      </Row>

      <Label>Disabled group</Label>
      <Row>{Show([toggleGroup().item('day', 'Day').item('week', 'Week').item('month', 'Month').value('week').disabled()])}</Row>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
