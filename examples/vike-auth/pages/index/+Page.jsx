// Home: reads the current user with vike-auth's useUser() hook (which just surfaces the
// `pageContext.user` the server tier resolved from the session cookie) and links into the
// extension-owned auth pages. Signed in, it shows the account + a logout form; signed out, a
// sign-in link. The magic-link flow itself lives entirely in vike-auth — this app writes no
// auth code.
import { useUser } from 'vike-auth/react/hooks'

// Theme-driven colors (the same --color-* tokens vike-themes defines), so the page follows the
// active theme + light/dark appearance from the toolbar instead of hardcoding a palette.
const wrap = { maxWidth: 560, margin: '2rem auto', lineHeight: 1.6, color: 'var(--color-text)', padding: '0 1rem' }
const card = { border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 10, padding: '1rem 1.25rem', marginTop: '1rem' }
const link = { color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }
const btn = { padding: '0.35rem 0.7rem', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', cursor: 'pointer', fontSize: 13 }

export default function HomePage() {
  const user = useUser()
  return (
    <div style={wrap}>
      <h1 style={{ marginBottom: 0 }}>vike-auth example</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: '0.25rem' }}>
        Magic-link auth in one install. The <code>/login</code> + <code>/account</code> pages and the
        whole session flow come from <code>vike-auth/react</code> — this app adds only a home page
        and one guarded page.
      </p>

      <div style={card}>
        {user ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <strong>Signed in as {user.email}</strong>
              <form method="post" action="/auth/logout" style={{ margin: 0 }}>
                <button type="submit" style={btn}>Log out</button>
              </form>
            </div>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--color-muted)', fontSize: 14 }}>
              {user.name ? `Welcome back, ${user.name}. ` : ''}
              Visit your <a href="/account" style={link}>account</a> or the{' '}
              <a href="/protected" style={link}>protected page</a>.
            </p>
          </>
        ) : (
          <>
            <strong>Not signed in</strong>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--color-muted)', fontSize: 14 }}>
              <a href="/login" style={link}>Sign in</a> with a magic link (in dev the link is shown
              inline — no inbox needed). Try the seeded account <code>ada@example.com</code>, or any
              email. Then try the <a href="/protected" style={link}>protected page</a>.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
