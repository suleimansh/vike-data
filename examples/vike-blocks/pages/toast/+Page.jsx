// The toast block demo. Unlike the other demos (which render a block descriptor), a toast is FIRED
// imperatively, Sonner-style: click a button and it calls `toast(...)`, and the `<Toaster>` region
// mounted at the bottom renders it in a corner stack (auto-dismiss, close button, enter/exit). The
// buttons show the six positions, the intent variants, and a toast with a description. This is the
// library's one imperative surface; everything else stays declarative block data.
import { toast } from 'vike-blocks'
import { Toaster } from 'vike-blocks/react'

const POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']

const btn = {
  padding: '0.5rem 0.85rem',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  background: '#fff',
  color: '#0f172a',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
}
const Row = ({ children }) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', margin: '0 0 1.5rem' }}>{children}</div>
const Label = ({ children }) => <div style={{ fontSize: 13, color: '#64748b', margin: '0 0 0.5rem' }}>{children}</div>

export default function ToastPage() {
  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Toast block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A transient notification, fired imperatively like Sonner: <code>toast('Event created', {'{'} position {'}'})</code>. Mount a{' '}
        <code>{'<Toaster />'}</code> once and call <code>toast(...)</code> (or <code>toast.success</code> / <code>toast.error</code> / …) from anywhere.
        They stack in a corner, auto-dismiss after 4s, and can be closed. Colors read vike-themes CSS vars.
      </p>

      <Label>Positions</Label>
      <Row>
        {POSITIONS.map((p) => (
          <button key={p} style={btn} onClick={() => toast('Event has been created', { position: p })}>
            {p}
          </button>
        ))}
      </Row>

      <Label>Intents</Label>
      <Row>
        <button style={btn} onClick={() => toast.success('Changes saved')}>success</button>
        <button style={btn} onClick={() => toast.error('Something went wrong')}>error</button>
        <button style={btn} onClick={() => toast.warning('Your session expires soon')}>warning</button>
        <button style={btn} onClick={() => toast.info('A new version is available')}>info</button>
        <button style={btn} onClick={() => toast('Just a plain message')}>neutral</button>
      </Row>

      <Label>With a description + a longer life</Label>
      <Row>
        <button style={btn} onClick={() => toast.success('Deployment complete', { description: 'Pushed to production in 42s.', duration: 8000 })}>
          rich toast
        </button>
        <button style={btn} onClick={() => toast('Stays until closed', { duration: Infinity })}>
          persistent (no auto-dismiss)
        </button>
      </Row>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>

      {/* Mounted once; renders whatever toast(...) fires. In a real app this lives in the root layout. */}
      <Toaster position="bottom-right" />
    </div>
  )
}
