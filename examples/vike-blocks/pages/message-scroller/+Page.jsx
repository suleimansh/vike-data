// The message-scroller block demo. The scroller is the `message-scroller` block rendered through the
// registry (resolvePage + <Blocks>): a capped-height scroll container for a list of `message`s. It
// sticks to the bottom (auto-scrolls to the latest) on load; scroll up and a floating jump-to-latest
// button appears. Theme-native — every color reads a vike-themes CSS var. Completes the chat cluster.
import { definePage, resolvePage, messageScroller, message } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />

// A back-and-forth long enough to overflow the viewport (so the auto-scroll + jump button show).
const turns = [
  ['user', 'How do I add a migration in Rudder?'],
  ['assistant', 'Run `pnpm rudder migrate` — it applies pending migrations and regenerates the typed registry.'],
  ['user', 'And to just regenerate the types?'],
  ['assistant', 'Use `pnpm rudder schema:types`, no migration needed.'],
  ['user', 'How do I seed the database?'],
  ['assistant', '`pnpm rudder db:seed` runs your DatabaseSeeder.'],
  ['user', 'Where do the generated types live?'],
  ['assistant', 'In `.rudder/types/models.d.ts` — committed, so the registry is typed everywhere.'],
  ['user', 'Thanks!'],
  ['assistant', 'Anytime. Happy shipping ⚓'],
]

export default function MessageScrollerPage() {
  return (
    <div style={{ maxWidth: 520, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Message scroller block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A scroll container for a chat transcript: <code>messageScroller([...messages]).height('20rem')</code>. It sticks to the bottom on
        load (auto-scroll to the latest); scroll up and a floating jump-to-latest button appears. Completes the chat cluster with
        {' '}<code>bubble</code> and <code>message</code>.
      </p>

      {Show([messageScroller(turns.map(([from, body]) => message().from(from).author(from === 'user' ? 'You' : 'Rudder').body(body))).height('18rem')])}

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
