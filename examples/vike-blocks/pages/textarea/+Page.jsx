// The textarea block demo. Each textarea below is the `textarea` block rendered through the registry
// (resolvePage + <Blocks>), most of them composed inside a `field` (#426) so they show with a label /
// description. The surface is from-scratch and theme-native: full-width, bordered, vertically
// resizable, with a focus-visible ring, a tinted placeholder, and a dimmed disabled state.
// Display-only for now — value binding + submit is the actions axis (#385).
import { definePage, resolvePage, textarea, field } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render one block (or field-wrapped block) from a builder.
const One = (builder) => <Blocks sections={resolvePage(definePage({ sections: [builder] })).sections} />

export default function TextareaPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Textarea block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A from-scratch, theme-native multi-line input. <code>textarea().placeholder(...).rows(n)</code>; add <code>.value(...)</code> for
        an initial value, <code>.disabled()</code> to disable. Drag the bottom edge to resize. It pairs with <code>field</code> (#426) for
        its label / description, and with <code>input</code> (#427) it completes the basic text controls.
      </p>

      {One(field('Bio').description('A short description for your profile.').control(textarea().placeholder('Tell us about yourself...').rows(4)))}
      {One(field('Release notes').control(textarea().value('- Fixed the login bug\n- Faster page loads').rows(5)))}
      {One(field('Read-only note').description('This textarea is disabled.').control(textarea().value('Locked content').disabled().rows(3)))}

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
