// The bubble block demo. Each message is the `bubble` block rendered through the registry (resolvePage
// + <Blocks>): a sender-aligned chat bubble for AI chat UIs. `bubble(text).from('user')` right-aligns
// with the primary color; assistant bubbles left-align on the surface color. A bubble can also hold a
// rich body of nested blocks (here a markdown block). Theme-native — every color reads a vike-themes CSS var.
import { definePage, resolvePage, bubble } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// The bespoke `markdown` block is authored as a raw descriptor (it has no fluent builder).
const md = (source) => ({ block: 'markdown', source })

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />

export default function BubblePage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Bubble block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A single chat message bubble, sender-aligned. <code>bubble(text).from('user' | 'assistant')</code> — user messages align right
        on the primary color, assistant messages left on the surface color. A bubble can hold a rich body of nested blocks (e.g. markdown).
      </p>

      <div style={{ margin: '1rem 0' }}>
        {Show([
          bubble('How do I add a migration in Rudder?').from('user'),
          bubble([md('Run `pnpm rudder migrate` — it applies pending migrations and regenerates the typed registry.')]).from('assistant'),
          bubble('And to just regenerate the types?').from('user'),
          bubble('Use `pnpm rudder schema:types`, no migration needed.').from('assistant'),
        ])}
      </div>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
