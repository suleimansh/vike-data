// The spinner block demo. Each spinner below is the `spinner` block rendered through the registry
// (resolvePage + <Blocks>). It is a dep-free, theme-native loading ring: a pure-CSS rotating arc for
// indeterminate waits, with an optional tone + label (the label is also the accessible name).
import { definePage, resolvePage, spinner } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.75rem' }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.6rem' }}>{label}</div>
    {children}
  </div>
)

export default function SpinnerPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Spinner block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A loading spinner for indeterminate waits — the companion to <code>skeleton</code> (a placeholder) and{' '}
        <code>progress</code> (a measured bar). <code>spinner()</code>, <code>spinner().size(32)</code>,{' '}
        <code>spinner().tone('danger')</code>, <code>spinner().label('Loading...')</code>. Pure-CSS spin (no JS, no
        state), <code>role="status"</code>, respects <code>prefers-reduced-motion</code>.
      </p>

      <Section label="Sizes">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {Show([spinner().size(16)])}
          {Show([spinner()])}
          {Show([spinner().size(32)])}
          {Show([spinner().size(48)])}
        </div>
      </Section>

      <Section label="Tones">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {Show([spinner().size(28)])}
          {Show([spinner().size(28).tone('muted')])}
          {Show([spinner().size(28).tone('success')])}
          {Show([spinner().size(28).tone('warning')])}
          {Show([spinner().size(28).tone('danger')])}
        </div>
      </Section>

      <Section label="With a label">{Show([spinner().size(20).label('Loading orders...')])}</Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
