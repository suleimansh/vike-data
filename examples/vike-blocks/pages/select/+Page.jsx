// The select block demo. Each control below is the `select` block rendered through the registry
// (resolvePage + <Blocks>). It is a theme-native single-choice control over a native <select> with the
// browser chevron replaced by ours. `.placeholder()` shows a leading empty choice; `.value()` sets the
// initial selection; binding to a form is the actions axis (#385). Composes inside a `field` for a label.
import { definePage, resolvePage, select, field } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.25rem' }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{label}</div>
    {children}
  </div>
)

export default function SelectPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Select block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A theme-native single-choice control over a native <code>&lt;select&gt;</code> —{' '}
        <code>select().placeholder('Pick a plan').option('pro', 'Pro')</code>. Colors and radius read vike-themes CSS vars. For a
        searchable list use the <a href="/combobox">combobox</a> block. Value binding is the actions axis (#385).
      </p>

      <Section label="With a placeholder (starts empty)">
        {Show([select().placeholder('Pick a plan').option('free', 'Free').option('pro', 'Pro').option('team', 'Team')])}
      </Section>

      <Section label="Pre-selected + a disabled option">
        {Show([select().option('free', 'Free').option('pro', 'Pro').option('team', 'Team (sold out)', { disabled: true }).value('pro')])}
      </Section>

      <Section label="Disabled control">
        {Show([select().placeholder('Unavailable').option('a', 'Option A').disabled()])}
      </Section>

      <Section label="Inside a field">
        {Show([
          field('Timezone')
            .description('Used for scheduling and timestamps.')
            .control(select().placeholder('Select a timezone').option('utc', 'UTC').option('cet', 'CET').option('pst', 'PST').value('utc')),
        ])}
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
