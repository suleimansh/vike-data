// The rating block demo. Each rating below is the `rating` block rendered through the registry
// (resolvePage + <Blocks>): a dep-free, theme-native star rating. Hover to preview, click to set, arrow
// keys to adjust; .allowHalf() enables half-stars, .readOnly() renders a display (a product average),
// .name() adds a hidden input for native submit. Composes inside a field. Value is local state, seeded
// from .value() so SSR agrees with the first client render.
import { definePage, resolvePage, rating, field } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.75rem' }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.6rem' }}>{label}</div>
    {children}
  </div>
)

export default function RatingPage() {
  return (
    <div style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Rating block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A star-rating control. <code>rating(label).value(v).max(5).allowHalf().readOnly().name('score')</code>.
        <b> Hover</b> to preview, <b>click</b> to set, <b>arrow keys</b> to adjust. Half-stars, a read-only
        display mode, and a hidden input for native submit. Dep-free, theme-native.
      </p>

      <Section label="Interactive (click / arrow keys)">
        {Show([rating('Rate your order').value(4).name('score')])}
      </Section>

      <Section label="Half-star precision">
        {Show([rating('Half stars').value(3.5).allowHalf().name('half')])}
      </Section>

      <Section label="Read-only display (a product average)">
        {Show([rating('Average').value(4.5).allowHalf().readOnly()])}
      </Section>

      <Section label="Composed inside a field">
        {Show([field('How likely are you to recommend us?').control(rating().value(0).name('nps'))])}
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
