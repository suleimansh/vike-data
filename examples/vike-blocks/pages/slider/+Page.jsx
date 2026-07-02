// The slider block demo. Each slider below is the `slider` block rendered through the registry
// (resolvePage + <Blocks>). A dep-free, theme-native range control — drag the thumb, click the rail,
// or focus the thumb and use the arrow keys (Home / End jump to the ends). `value` is the initial
// position; binding to a form is the actions axis (#385). A slider composes inside a `field` (#426).
import { definePage, resolvePage, slider, field } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render one or more block builders through the registry.
const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Stack = ({ children }) => <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0 0 1.25rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{children}</div>

export default function SliderPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Slider block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A dep-free, theme-native range control. <code>slider(label).min(0).max(100).step(1).value(v)</code> — drag the thumb, click the
        rail, or focus the thumb and use the arrow keys (Home / End jump to the ends). The readout tracks the value. Colors read vike-themes
        CSS vars. Value binding is the actions axis (#385).
      </p>

      <Label>Drag or arrow-key these</Label>
      <Stack>{Show([slider('Volume').value(70), slider('Brightness').value(40)])}</Stack>

      <Label>Stepped (0-10, step 2)</Label>
      <Stack>{Show([slider('Rating').min(0).max(10).step(2).value(6)])}</Stack>

      <Label>Disabled</Label>
      <Stack>{Show([slider('Locked').value(30).disabled()])}</Stack>

      <Label>Inside a field</Label>
      <Stack>{Show([field('Volume').description('How loud the notification chime plays.').control(slider().value(55))])}</Stack>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
