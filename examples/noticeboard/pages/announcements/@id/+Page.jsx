// The announcement permalink — where a mail link, a push click, or a Bell item lands.
import { useData } from 'vike-react/useData'

export default function AnnouncementPage() {
  const { announcement } = useData()
  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <a href="/" style={{ color: 'var(--color-primary)' }}>← Board</a>
      <h1 style={{ marginBottom: '0.25rem' }}>{announcement.title}</h1>
      <small style={{ color: 'var(--color-muted)' }}>
        {announcement.author} · {new Date(announcement.created_at).toLocaleString()}
      </small>
      <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{announcement.body}</p>
    </div>
  )
}
