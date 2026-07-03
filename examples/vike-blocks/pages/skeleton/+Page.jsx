// The skeleton block demo. Each control below is the `skeleton` block rendered through the registry
// (resolvePage + <Blocks>). It is a dep-free, theme-native pulsing placeholder (pure-CSS pulse, no JS,
// no state) shown while content loads. Compose several to mock a card / list / form loading state.
import { definePage, resolvePage, skeleton, card } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.75rem' }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.6rem' }}>{label}</div>
    {children}
  </div>
)

export default function SkeletonPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Skeleton block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A pulsing placeholder shown while content loads. <code>skeleton().circle(40)</code>, <code>skeleton().width('60%')</code>,{' '}
        <code>skeleton().lines(3)</code>. Pure CSS (no JS, no state), theme-native, and it stops pulsing under{' '}
        <code>prefers-reduced-motion</code>. Compose several to mock any loading state.
      </p>

      <Section label="A single bar">{Show([skeleton()])}</Section>

      <Section label="A title + a paragraph (lines)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {Show([skeleton().height('1.6rem').width('50%')])}
          {Show([skeleton().lines(3)])}
        </div>
      </Section>

      <Section label="Avatar + two lines (a list row loading)">
        <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'center' }}>
          {Show([skeleton().circle(44)])}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Show([skeleton().height('0.9rem').width('70%')])}
            {Show([skeleton().height('0.9rem').width('45%')])}
          </div>
        </div>
      </Section>

      <Section label="Inside a card (a loading card)">
        {Show([card([skeleton().height('7rem').radius(10), skeleton().height('1.2rem').width('60%'), skeleton().lines(2)])])}
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
