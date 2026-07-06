// Shared prose block so each route's page focuses on its content, not styling. The surrounding
// chrome (rail, header, footer) is the SHELL — this is just the page body handed to the content slot.
export function Doc({ title, children }) {
  return (
    <article style={{ maxWidth: 640, lineHeight: 1.65 }}>
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      {children}
    </article>
  )
}

export const code = (t) => <code style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 4, padding: '0.1rem 0.35rem', fontSize: '0.9em' }}>{t}</code>
