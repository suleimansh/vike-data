// The radio block demo. Each group below is the `radio` block rendered through the registry
// (resolvePage + <Blocks>). It is a dep-free, theme-native radio group with an animated selection —
// click an option and watch the dot spring in. `.value()` sets the initial selection; binding to a
// form is the actions axis (#385). A group composes inside a `field` (#426) for its label.
import { definePage, resolvePage, radio, field } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render one or more block builders through the registry.
const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.25rem' }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{label}</div>
    {children}
  </div>
)

export default function RadioPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Radio block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A dep-free, theme-native radio group with an animated selection. <code>radio().option('pro', 'Pro').value('pro')</code> —
        click an option and watch the dot spring in. Colors and radius read vike-themes CSS vars. Selection binding is the actions axis (#385).
      </p>

      <Section label="Pick a plan">
        {Show([radio().option('free', 'Free').option('pro', 'Pro').option('team', 'Team').value('pro')])}
      </Section>

      <Section label="Disabled group">
        {Show([radio().option('a', 'Option A').option('b', 'Option B').value('a').disabled()])}
      </Section>

      <Section label="Inside a field">
        {Show([
          field('Notifications')
            .description('How often should we email you?')
            .control(radio().option('all', 'Every update').option('daily', 'Daily digest').option('none', 'Never').value('daily')),
        ])}
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
