// Sidebar app frame — signed-in chrome with vertical nav down the leading side (logo on top, user
// menu at the bottom), content in the main column. Since #401 this is a `layout`-block VARIANT that
// arranges vike-blocks <SlotView> regions (chrome from the config seam, body from the live-content
// seam); registered into the block LayoutView by ../ConfigLayout. `end: true` nav items sink to the
// bottom above the user menu (#303). The nav is vertical, so its SlotViews pass `vertical`.
import { SlotView } from 'vike-blocks/react/SlotView'
import { useLayoutConfig } from 'vike-blocks/react/LayoutView'

export function SidebarShell() {
  const { dir, logo } = useLayoutConfig()
  return (
    <div dir={dir} style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)' }}>
      <aside
        style={{
          width: 220,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-lg, 2rem)',
          padding: 'var(--space-lg, 2rem)',
          borderInlineEnd: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
        }}
      >
        {logo && <strong><SlotView name="logo" from="config" /></strong>}
        <SlotView name="nav" from="config" only="start" vertical />
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg, 2rem)' }}>
          <SlotView name="nav" from="config" only="end" vertical />
          <SlotView name="userMenu" from="config" />
        </div>
      </aside>
      <main style={{ flex: 1, padding: 'var(--space-lg, 2rem)' }}>
        <SlotView from="content" />
      </main>
    </div>
  )
}
