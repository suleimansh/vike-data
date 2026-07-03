// The payoff of +guard.js: this component only ever renders for a signed-in user, so it can
// read pageContext.user directly. An unauthenticated visitor never reaches here — the guard
// redirected them to /login?next=/protected first.
import { useUser } from 'vike-auth/react/hooks'

const wrap = { maxWidth: 560, margin: '3rem auto', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6, color: '#1a1a1a', padding: '0 1rem' }

export default function ProtectedPage() {
  const user = useUser()
  return (
    <div style={wrap}>
      <h1>Protected page</h1>
      <p style={{ color: '#64748b' }}>
        You are seeing this because you are signed in as <strong>{user?.email}</strong>. Sign out from
        the <a href="/" style={{ color: '#2563eb', fontWeight: 600 }}>home page</a> and this route bounces
        you to the sign-in form.
      </p>
    </div>
  )
}
