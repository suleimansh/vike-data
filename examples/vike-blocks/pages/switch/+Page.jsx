// The switch block demo. Each switch below is the `switch` block (builder `toggle`) rendered through
// the registry (resolvePage + <Blocks>). A dep-free, theme-native toggle with an animated sliding
// thumb — click one and watch the thumb slide. `checked` is the initial state; binding to a form is
// the actions axis (#385). A switch composes inside a `field` (#426) for its label / description.
import { definePage, resolvePage, toggle, field } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render one or more block builders through the registry.
const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Stack = ({ children }) => <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0 0 1.25rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{children}</div>

export default function SwitchPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Switch block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A dep-free, theme-native toggle with an animated sliding thumb. <code>toggle(label).checked().disabled()</code> — click one and
        watch the thumb slide. The builder is <code>toggle</code> (<code>switch</code> is a reserved word). Colors read vike-themes CSS
        vars. Value binding is the actions axis (#385).
      </p>

      <Label>Toggle these</Label>
      <Stack>{Show([toggle('Dark mode').checked(), toggle('Email notifications'), toggle('Auto-save drafts').checked()])}</Stack>

      <Label>Disabled</Label>
      <Stack>{Show([toggle('On and locked').checked().disabled(), toggle('Off and locked').disabled()])}</Stack>

      <Label>Inside a field</Label>
      <Stack>{Show([field('Appearance').description('Use the dark theme across the app.').control(toggle('Dark mode').checked())])}</Stack>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
