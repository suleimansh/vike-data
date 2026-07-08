// The board: the announcements feed, plus the two delivery controls — the in-app Bell
// (vike-notifications' feed for the signed-in user) and the web-push subscribe toggle
// (vike-push). Publishing happens on /announcements/new (rbac-gated); every publish lands
// here for everyone, in the Bell for members, and in their inbox/browser when the real
// transports are configured.
import { useData } from 'vike-react/useData'
import { useUser } from 'vike-auth/react/hooks'
import { UserButton } from 'vike-auth/react/UserButton'
import { NotificationsBell } from 'vike-notifications/react/Bell'
import { PushToggle } from 'vike-push/react/PushToggle'

const since = (at) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(at).getTime()) / 60000))
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export default function BoardPage() {
  const { announcements } = useData()
  const user = useUser()
  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        {user && <NotificationsBell />}
        {user && <PushToggle label="Push" />}
        <UserButton />
      </div>
      <h1 style={{ marginTop: 0 }}>Team board</h1>
      {!user && (
        <p style={{ color: 'var(--color-muted)' }}>
          <a href="/login" style={{ color: 'var(--color-primary)' }}>Sign in</a> with a magic link
          (printed to the dev console) to get notified about new announcements.
        </p>
      )}
      {announcements.length === 0 && (
        <p style={{ color: 'var(--color-muted)' }}>
          Nothing posted yet. Run <code>pnpm db:seed</code>, or{' '}
          <a href="/announcements/new" style={{ color: 'var(--color-primary)' }}>post the first announcement</a>.
        </p>
      )}
      {announcements.map((a) => (
        <article
          key={a.id}
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius, 8px)',
            padding: '1rem 1.25rem',
            marginBottom: '0.75rem',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>
            <a href={`/announcements/${a.id}`} style={{ color: 'var(--color-text)', textDecoration: 'none' }}>{a.title}</a>
          </h2>
          <p style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>{a.body}</p>
          <small style={{ color: 'var(--color-muted)' }}>{a.author} · {since(a.created_at)}</small>
        </article>
      ))}
    </div>
  )
}
