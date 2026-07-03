// The command block demo. The `command` block rendered through the registry (resolvePage + <Blocks>). It
// is a dep-free, theme-native ⌘K command palette on the Overlay primitive: a trigger button + a global
// ⌘K hotkey open a modal with a filter input over grouped items; arrow-keys + Enter run one (navigating
// to its `to`). Type to filter, ↑/↓ to move, Enter to select, Esc to close.
import { definePage, resolvePage, command } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

const palette = command()
  .placeholder('Search commands or pages...')
  .group('Navigation')
  .item('Catalog home', { to: '/', shortcut: '⌘H' })
  .item('Tabs', { to: '/tabs' })
  .item('Dialog', { to: '/dialog' })
  .item('Pagination', { to: '/pagination' })
  .group('Blocks')
  .item('Avatar', { to: '/avatar' })
  .item('Breadcrumb', { to: '/breadcrumb' })
  .item('Skeleton', { to: '/skeleton' })
  .item('Tooltip', { to: '/tooltip' })
  .group('Actions')
  .item('Back to catalog', { to: '/', shortcut: '⌘B' })

export default function CommandPage() {
  return (
    <div style={{ maxWidth: 560, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Command block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A ⌘K command palette on the Overlay primitive. Click the trigger <em>or press ⌘K / Ctrl+K</em> to open, type to filter
        the grouped items, ↑/↓ to move, Enter to run (each item navigates to its <code>to</code>), Esc to close. Dep-free,
        theme-native; the modal SSR-renders only the trigger.
      </p>

      <div style={{ margin: '1.5rem 0' }}>{<Blocks sections={resolvePage(definePage({ sections: [palette] })).sections} />}</div>

      <p style={{ color: '#64748b', fontSize: 14 }}>The item shortcuts (⌘H, ⌘B) are display hints; wiring real per-item hotkeys is the actions axis (#385).</p>

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
