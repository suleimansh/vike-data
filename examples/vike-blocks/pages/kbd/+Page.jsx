// The kbd block demo. Each row is the `kbd` block rendered through the registry (resolvePage +
// <Blocks>): a static row of keyboard key caps for documenting shortcuts. `kbd('K')` is one cap;
// `kbd(['Ctrl', 'K'])` is a combo. Theme-native — the caps read vike-themes CSS vars.
import { definePage, resolvePage, kbd } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Row = ({ children }) => <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '0 0 0.9rem' }}>{children}</div>
const Note = ({ children }) => <span style={{ fontSize: 14, color: '#475569' }}>{children}</span>

export default function KbdPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Kbd block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        Keyboard key caps for documenting shortcuts. <code>kbd('Esc')</code> is a single cap; <code>kbd(['Cmd', 'K'])</code> renders a
        combo. Static and theme-native — the caps read vike-themes CSS vars.
      </p>

      <Row>{Show([kbd('Esc')])}<Note>close a dialog</Note></Row>
      <Row>{Show([kbd(['Cmd', 'K'])])}<Note>open the command palette</Note></Row>
      <Row>{Show([kbd(['Ctrl', 'Shift', 'P'])])}<Note>run a command</Note></Row>
      <Row>{Show([kbd('/')])}<Note>focus search</Note></Row>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
