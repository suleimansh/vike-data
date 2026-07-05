// The stepper block demo. The stepper below is the `stepper` block rendered through the registry
// (resolvePage + <Blocks>): a multi-step wizard with a numbered progress header (complete / current /
// upcoming states + connectors) over one step's content, Back / Next navigation, and a step that
// composes fields + a form. The sequential sibling of tabs; each step holds any blocks. Dep-free,
// theme-native. Which step shows is local state, seeded from `current` so SSR renders it without a flash.
import { definePage, resolvePage, stepper, field, input, form, text, heading } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />

export default function StepperPage() {
  return (
    <div style={{ maxWidth: 620, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Stepper block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A multi-step wizard — the multi-step-form surface. <code>stepper().step(title, [blocks], {'{ description }'})</code>.
        The header shows complete / current / upcoming steps; <b>click a step</b> to jump, or use Back / Next.
        Each step composes any blocks (the last step holds a real form). Next is omitted on the last step so
        the form's own submit finishes.
      </p>

      <div style={{ margin: '2rem 0', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: 12 }}>
        {Show([
          stepper()
            .step('Account', [
              heading('Create your account').level(3),
              field('Email').control(input().type('email').placeholder('you@example.com')),
              field('Username').control(input().placeholder('ada')),
            ], { description: 'How we reach you' })
            .step('Profile', [
              heading('Tell us about you').level(3),
              field('Display name').control(input().placeholder('Ada Lovelace')),
              field('Company').control(input().placeholder('Analytical Engines')),
            ], { description: 'Optional' })
            .step('Confirm', [
              heading('Review & submit').level(3),
              text('Everything look right? Submit to create your account.').tone('muted'),
              form({ action: '/signup', method: 'post' })
                .fields([field('Confirm email').control(input().type('email').placeholder('you@example.com'))])
                .submit('Create account'),
            ], { description: 'Finish up' }),
        ])}
      </div>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
