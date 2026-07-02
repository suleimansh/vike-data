// The checkbox block demo. Each checkbox below is the `checkbox` block rendered through the registry
// (resolvePage + <Blocks>). It is a dep-free, theme-native boolean control with an animated check —
// click one to toggle it and watch the check spring in. `checked` is the initial state; binding to a
// form is the actions axis (#385). A group of checkboxes composes inside a `field` (#426) for its label.
import { definePage, resolvePage, checkbox, field } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render one or more block builders through the registry.
const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Stack = ({ children }) => <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', margin: '0 0 1.25rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{children}</div>

export default function CheckboxPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Checkbox block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A dep-free, theme-native boolean control with an animated check. <code>checkbox(label).checked().disabled()</code> — click one
        to toggle it and watch the check spring in. Colors and radius read vike-themes CSS vars. Value binding is the actions axis (#385).
      </p>

      <Label>Toggle these</Label>
      <Stack>
        {Show([checkbox('Accept the terms of service').checked(), checkbox('Subscribe to the newsletter'), checkbox('Enable two-factor auth')])}
      </Stack>

      <Label>Disabled</Label>
      <Stack>{Show([checkbox('Checked and locked').checked().disabled(), checkbox('Unchecked and locked').disabled()])}</Stack>

      <Label>Inside a field</Label>
      <Stack>{Show([field('Consent').description('You can change this later in settings.').control(checkbox('I agree to receive updates'))])}</Stack>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
