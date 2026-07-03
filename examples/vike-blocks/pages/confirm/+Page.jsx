// The confirm block demo. Each control below is the `confirm` block rendered through the registry
// (resolvePage + <Blocks>). It is an alert dialog that guards a destructive action, on the shared
// Overlay primitive. In `action` mode it owns a real <form> (submits with no JS; hydrated, the submit
// is gated behind the dialog); it can also navigate on confirm (`to`) or just close. A themed
// replacement for window.confirm.
import { definePage, resolvePage, confirm } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Section = ({ label, children }) => (
  <div style={{ margin: '0 0 1.5rem' }}>
    <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.4rem' }}>{label}</div>
    {children}
  </div>
)

export default function ConfirmPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Confirm block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        An alert dialog that guards a destructive action, on the shared Overlay primitive.{' '}
        <code>confirm('Delete').danger().action('/posts/42').field('_action', 'delete')</code> — a themed replacement for{' '}
        <code>window.confirm</code>. In <code>action</code> mode it owns a real form, so it still submits with no client JS; once
        hydrated the submit is gated behind the dialog. The mutation is the actions axis (#385); open/close is local state.
      </p>

      <Section label="Destructive action (form mode) — posts to /demo/delete on confirm">
        {Show([
          confirm('Delete post')
            .danger()
            .title('Delete this post?')
            .description('This permanently removes the post and cannot be undone.')
            .confirmLabel('Delete')
            .action('/demo/delete')
            .field('_action', 'delete')
            .field('id', '42'),
        ])}
      </Section>

      <Section label="Compact link trigger (as in a table row)">
        {Show([confirm('Delete').link().danger().title('Delete this row?').description('This cannot be undone.').confirmLabel('Delete').action('/demo/delete').field('_action', 'delete')])}
      </Section>

      <Section label="Navigate on confirm (no form)">
        {Show([confirm('Sign out').title('Sign out?').description('You will need to sign in again to continue.').confirmLabel('Sign out').to('/')])}
      </Section>

      <Section label="Non-destructive (primary intent)">
        {Show([confirm('Publish').title('Publish now?').description('This makes the post visible to everyone.').confirmLabel('Publish').action('/demo/publish')])}
      </Section>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
