// The empty-state block demo. Each example is the `empty-state` block rendered through the registry
// (resolvePage + <Blocks>). It's the "no results / get started" surface every table and list needs: an
// illustration medallion + title + description + an optional row of action blocks. Compose it with the
// built-in inbox icon, or pass any block to `.icon()` (an avatar, a custom illustration). Static and
// theme-native — no state, no client JS.
import { definePage, resolvePage, emptyState, button, avatar } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const Show = (builders) => <Blocks sections={resolvePage(definePage({ sections: builders })).sections} />
const Label = ({ children }) => <div style={{ fontSize: 13, color: 'var(--color-muted)', margin: '1.75rem 0 0.6rem' }}>{children}</div>

export default function EmptyStatePage() {
  return (
    <div style={{ maxWidth: 620, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif', color: 'var(--color-text)' }}>
      <h1 style={{ marginTop: 0 }}>Empty-state block</h1>
      <p style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
        The "no results / get started" surface for a table or list.{' '}
        <code>emptyState('No posts yet').description(...).actions([...])</code> — an illustration medallion, a title, a
        muted description, and an optional row of action blocks. The medallion draws a built-in icon, or any block you
        pass to <code>.icon()</code>.
      </p>

      <Label>Get started (title + description + action)</Label>
      {Show([
        emptyState('No posts yet')
          .description('Create your first post and it will show up here.')
          .actions([button('New post').variant('primary')]),
      ])}

      <Label>No search results (two actions)</Label>
      {Show([
        emptyState('No results')
          .description('No posts matched your filters. Try a broader search or clear the filters.')
          .actions([button('Clear filters').variant('outline'), button('New post').variant('primary')]),
      ])}

      <Label>A custom icon block (an avatar)</Label>
      {Show([
        emptyState('No teammates yet')
          .description('Invite someone to collaborate on this workspace.')
          .icon(avatar().name('Ada Lovelace').size(44))
          .actions([button('Invite a teammate').variant('primary')]),
      ])}

      <Label>Bare (title only)</Label>
      {Show([emptyState('Nothing here')])}

      <p style={{ marginTop: '1.75rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
