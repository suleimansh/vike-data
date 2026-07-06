// The card BODY the centered shell wraps. The shell supplies the logo + centered card; this
// page just fills it. A real app would drop vike-auth's login form here.
export default function LoginPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>Sign in</h1>
      <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 14 }}>
        The centered shell drops app nav and the user menu — it declares only the logo slot.
      </p>
      <input placeholder="you@example.com" style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
      <input placeholder="Password" type="password" style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }} />
      <button style={{ padding: '0.6rem', borderRadius: 8, border: 'none', background: 'var(--color-primary, #4f46e5)', color: '#fff', cursor: 'pointer' }}>Continue</button>
      <a href="/" style={{ fontSize: 13, color: 'var(--color-muted)' }}>← Back to the app</a>
    </div>
  )
}
