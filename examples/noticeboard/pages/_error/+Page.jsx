// The error page Vike renders for throw render(403/404, message) and unexpected failures.
// `pageContext.abortReason` carries the message a guard/data hook passed to render().
import { usePageContext } from 'vike-react/usePageContext'

export default function ErrorPage() {
  const { is404, abortReason } = usePageContext()
  return (
    <div style={{ maxWidth: 640, margin: '4rem auto', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>{is404 ? '404' : 'Oops'}</h1>
      <p style={{ color: 'var(--color-muted)' }}>
        {typeof abortReason === 'string' ? abortReason : is404 ? 'Nothing here.' : 'Something went wrong.'}
      </p>
      <a href="/" style={{ color: 'var(--color-primary)' }}>← Back to the board</a>
    </div>
  )
}
