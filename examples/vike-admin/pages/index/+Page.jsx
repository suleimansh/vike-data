// Home: the on-ramp. It shows whether you're signed in (vike-auth's useUser()) and links into
// the admin panel. /admin/* is fenced to signed-in users by vike-admin's own guard, so if you
// click through while signed out you land on /login first, then back to /admin.
import { useUser } from 'vike-auth/react/hooks'

const wrap = { maxWidth: 600, margin: '2rem auto', lineHeight: 1.6, color: 'var(--color-text)', padding: '0 1rem' }
const card = { border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 10, padding: '1rem 1.25rem', marginTop: '1rem' }
const link = { color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }

export default function HomePage() {
  const user = useUser()
  return (
    <div style={wrap}>
      <h1 style={{ marginBottom: 0 }}>vike-admin example</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: '0.25rem' }}>
        A working admin panel on install. This app declares two tables (<code>posts</code>,{' '}
        <code>tags</code>) through the schema DSL and contributes three <code>adminResources</code>;
        the <code>/admin/*</code> list/create/edit/delete pages are <strong>derived</strong> from the
        composed schema by <code>vike-admin/react</code>. No ORM code, no CRUD pages.
      </p>

      <div style={card}>
        {user ? (
          <>
            <strong>Signed in as {user.email}</strong>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--color-muted)', fontSize: 14 }}>
              Open the <a href="/admin" style={link}>admin panel</a> — try Posts (a curated list +
              form, with an author picker), Tags (bare, fully derived from the schema), and Users.
            </p>
          </>
        ) : (
          <>
            <strong>Not signed in</strong>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--color-muted)', fontSize: 14 }}>
              The admin panel is fenced to signed-in users. <a href="/login" style={link}>Sign in</a>{' '}
              (magic link, shown inline in dev — try the seeded <code>ada@example.com</code>), then open{' '}
              <a href="/admin" style={link}>/admin</a>.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
