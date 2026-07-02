// The input block demo. Each input below is the `input` block rendered through the registry
// (resolvePage + <Blocks>), grouped into labelled rows. The surface is from-scratch and theme-native:
// full-width, bordered, with a focus-visible ring, a tinted placeholder, and a dimmed disabled state.
// Display-only for now — value binding + submit is the actions axis (#385); `field` (#426) will wrap
// an input with its label / description / error shell.
import { definePage, resolvePage, input } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render a single input block from a builder.
const Input = (builder) => <Blocks sections={resolvePage(definePage({ sections: [builder] })).sections} />
const Field = ({ label, children }) => (
  <div style={{ margin: '0 0 1.1rem' }}>
    <div style={{ fontSize: 13, fontWeight: 500, color: '#334155', margin: '0 0 0.35rem' }}>{label}</div>
    {children}
  </div>
)

export default function InputPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Input block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A from-scratch, theme-native text input. <code>input().type('email').placeholder(...)</code>; add <code>.value(...)</code> for an
        initial value, <code>.disabled()</code> to disable, <code>.required()</code> to mark required. Focus one to see the ring. Colors
        and radius read vike-themes CSS vars. Value binding is the actions axis (#385); <code>field</code> (#426) adds the label / error shell.
      </p>

      <Field label="Email (type + placeholder)">{Input(input().type('email').placeholder('you@example.com'))}</Field>
      <Field label="Search">{Input(input().type('search').placeholder('Search posts'))}</Field>
      <Field label="Password">{Input(input().type('password').name('password').value('hunter2'))}</Field>
      <Field label="With an initial value">{Input(input().value('Prefilled text'))}</Field>
      <Field label="Disabled">{Input(input().value('Read only').disabled())}</Field>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
