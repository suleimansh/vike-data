// The form block: a non-schema form container — group field/control blocks in a real, ready-to-post
// <form> with a submit button. The hand-authored counterpart to vike-view's schema-derived form; it
// takes the fields you compose. Scoped to NATIVE HTML submission (method + action), so it works with
// progressive enhancement and zero client JS. The richer JS submission (named actions, optimistic UI,
// inline validation) is the actions axis (#385).
import { definePage, form, field, input, textarea, radioGroup, checkbox, heading, text, card } from 'vike-blocks'
import { Page } from 'vike-blocks/react'

const page = definePage({
  sections: [
    heading('Form block').level(1),
    text('Group field + control blocks into a real <form>. Native POST — the form submits with progressive enhancement, no client JS. The create/edit workhorse; the plain-data counterpart to the schema-driven form.').tone('muted'),

    heading('Create member').level(3),
    text('A create form: fields + a submit that POSTs to an action URL.'),
    form({ action: '/members', method: 'post' })
      .fields([
        field('Name').control(input().name('name').placeholder('Ada Lovelace').required()),
        field('Email').description('We never share it.').control(input().type('email').name('email').placeholder('you@example.com')),
        field('Role').control(radioGroup().name('role').option('admin', 'Admin').option('member', 'Member').value('member')),
        field('Bio').control(textarea().name('bio').placeholder('A short bio...').rows(3)),
      ])
      .submit('Create member'),

    heading('Edit form (pre-filled)').level(3),
    text('The same shape with .value() pre-filling on edit, and a custom submit label.'),
    form({ action: '/members/42', method: 'post' })
      .fields([
        field('Name').control(input().name('name').value('Ada Lovelace')),
        field('Active').control(checkbox('Active').name('active')),
      ])
      .submit('Save changes'),

    heading('Inside a card').level(3),
    text('A form composes anywhere — here wrapped in a card for a settings-panel look.'),
    card([
      form({ action: '/settings', method: 'post' })
        .fields([field('Workspace name').control(input().name('workspace').value('Acme'))])
        .submit('Update'),
    ]).title('Workspace settings'),
  ],
})

export default function FormPage() {
  return (
    <div style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <Page page={page} />
      <p style={{ marginTop: '1.5rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
