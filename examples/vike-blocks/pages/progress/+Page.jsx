// The progress block demo. Each control below is the `progress` block rendered through the registry
// (resolvePage + <Blocks>). It is a dep-free, theme-native progress bar: a determinate pure-CSS fill or
// an animated indeterminate segment, with an optional label + value% caption row.
import { definePage, resolvePage, progress } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.75rem', maxWidth: 380 }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.6rem' }}>{label}</div>
    {children}
  </div>
)

export default function ProgressPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Progress block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A determinate or indeterminate progress bar. <code>progress(66)</code>, <code>progress().value(3).max(5)</code>,{' '}
        <code>progress().indeterminate()</code>. Pure CSS (no JS, no state), theme-native (the fill reads{' '}
        <code>--color-primary</code>). Add <code>.label()</code> for a caption row with the value%.
      </p>

      <Section label="Determinate">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {Show([progress(30)])}
          {Show([progress(66)])}
          {Show([progress(100)])}
        </div>
      </Section>

      <Section label="With a label + value%">{Show([progress().value(3).max(5).label('Uploading files')])}</Section>

      <Section label="Indeterminate (unknown duration)">{Show([progress().indeterminate().label('Loading...')])}</Section>

      <Section label="Custom heights">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {Show([progress(50).size(4)])}
          {Show([progress(50).size(12)])}
        </div>
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
