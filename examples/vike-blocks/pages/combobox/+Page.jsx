// The combobox block demo. Each control below is the `combobox` block rendered through the registry
// (resolvePage + <Blocks>). It is a searchable single-select — a popover with a filter input and a
// role="listbox"; type to filter, arrow-key + Enter to pick. A hidden input carries the value for a
// plain form POST; binding is the actions axis (#385). Composes inside a `field` for a label.
import { definePage, resolvePage, combobox, field } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.25rem' }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{label}</div>
    {children}
  </div>
)

// A longer list to show the filter earning its keep.
const people = combobox()
  .placeholder('Assign to...')
  .searchPlaceholder('Search people')
  .option('ada', 'Ada Lovelace')
  .option('alan', 'Alan Turing')
  .option('grace', 'Grace Hopper')
  .option('katherine', 'Katherine Johnson')
  .option('linus', 'Linus Torvalds')
  .option('margaret', 'Margaret Hamilton')

export default function ComboboxPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Combobox block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A searchable single-select on the popover primitive — <code>combobox().option('ada', 'Ada Lovelace')</code>. Type to filter,
        arrow-key + Enter to pick, outside-click / Escape to close. For a short fixed list the plain <a href="/select">select</a> is
        lighter. Value binding is the actions axis (#385).
      </p>

      <Section label="Searchable (type to filter)">{Show([people])}</Section>

      <Section label="Pre-selected">
        {Show([combobox().option('ada', 'Ada Lovelace').option('alan', 'Alan Turing').option('grace', 'Grace Hopper').value('grace')])}
      </Section>

      <Section label="Custom empty text">
        {Show([combobox().placeholder('Pick a fruit').empty('No fruit by that name.').option('apple', 'Apple').option('pear', 'Pear')])}
      </Section>

      <Section label="Inside a field">
        {Show([field('Owner').description('Who is responsible for this record?').control(people)])}
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
