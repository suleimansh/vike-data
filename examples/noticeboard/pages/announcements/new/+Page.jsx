// The publish form. useAction drives vike-actions' endpoint (POST /_actions/announcements.publish);
// the action inserts the row and fans out one notify() per member, then its onSuccess hint
// (toast + redirect to the board) runs here through the ActionsProvider in +Wrapper.jsx.
import { useState } from 'react'
import { useAction } from 'vike-actions/react'

const label = { display: 'block', margin: '1rem 0 0.25rem', fontWeight: 600 }
const control = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius, 8px)',
  font: 'inherit',
}

export default function NewAnnouncementPage() {
  const { run, pending, error } = useAction('announcements.publish')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    await run({ title: title.trim(), body: body.trim() })
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Post an announcement</h1>
      <p style={{ color: 'var(--color-muted)' }}>
        Everyone on the team gets it: in-app (the Bell), by email, and by push where subscribed.
      </p>
      <form onSubmit={submit}>
        <label style={label} htmlFor="title">Title</label>
        <input id="title" style={control} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label style={label} htmlFor="body">Announcement</label>
        <textarea
          id="body"
          style={{ ...control, resize: 'vertical' }}
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />
        {error && <p style={{ color: 'var(--color-danger, #dc2626)' }}>{String(error)}</p>}
        <button
          type="submit"
          disabled={pending || !title.trim() || !body.trim()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1.25rem',
            background: 'var(--color-primary)',
            color: 'var(--color-primary-text)',
            border: 'none',
            borderRadius: 'var(--radius, 8px)',
            font: 'inherit',
            cursor: pending ? 'wait' : 'pointer',
          }}
        >
          {pending ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </div>
  )
}
