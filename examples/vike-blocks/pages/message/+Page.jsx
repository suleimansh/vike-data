// The message block demo. Each message is the `message` block rendered through the registry
// (resolvePage + <Blocks>): a chat bubble plus its avatar, author, and timestamp, aligned by sender.
// A message composes the `bubble` block for its body, which can be plain text or nested blocks (here a
// markdown block). Theme-native — every color reads a vike-themes CSS var.
import { definePage, resolvePage, message } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const md = (source) => ({ block: 'markdown', source })

export default function MessagePage() {
  return (
    <div style={{ maxWidth: 520, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Message block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A chat message: a <code>bubble</code> plus its metadata. <code>message().from('user').author('You').at('9:41 AM').body(...)</code>
        {' '}— the body folds into a composed bubble, with an avatar and an author/timestamp header aligned by sender.
      </p>

      <div style={{ margin: '1rem 0' }}>
        {Show([
          message().from('user').author('You').at('9:41 AM').body('How do I add a migration in Rudder?'),
          message()
            .from('assistant')
            .author('Rudder')
            .at('9:41 AM')
            .body([md('Run `pnpm rudder migrate` — it applies pending migrations and regenerates the typed registry.')]),
          message().from('user').author('You').at('9:42 AM').body('And to just regenerate the types?'),
          message().from('assistant').author('Rudder').at('9:42 AM').body('Use `pnpm rudder schema:types`, no migration needed.'),
        ])}
      </div>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
