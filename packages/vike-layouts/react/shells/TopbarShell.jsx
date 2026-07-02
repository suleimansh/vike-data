// Topbar app frame — signed-in chrome with horizontal nav across the top, logo on the leading
// side, user menu on the trailing side, page content below. Since #401 this is a `layout`-block
// VARIANT: it arranges vike-blocks <SlotView> regions (the chrome comes from the config seam, the
// body from the live-content seam) rather than reading a `layout` prop. Registered into the block
// LayoutView by ../ConfigLayout. `end: true` nav items sit trailing next to the user menu (#303).
import { SlotView } from 'vike-blocks/react/SlotView'
import { useLayoutConfig } from 'vike-blocks/react/LayoutView'

export function TopbarShell() {
  const { dir, logo, footer } = useLayoutConfig()
  return (
    <div dir={dir} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-lg, 2rem)',
          padding: 'var(--space-md, 1rem) var(--space-lg, 2rem)',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg, 2rem)' }}>
          {logo && (
            <strong>
              <SlotView name="logo" from="config" />
            </strong>
          )}
          <SlotView name="nav" from="config" only="start" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg, 2rem)' }}>
          <SlotView name="nav" from="config" only="end" />
          <SlotView name="userMenu" from="config" />
        </div>
      </header>
      <main style={{ flex: 1, padding: 'var(--space-lg, 2rem)' }}>
        <SlotView from="content" />
      </main>
      {footer?.length > 0 && (
        <footer style={{ padding: 'var(--space-md, 1rem) var(--space-lg, 2rem)', borderTop: '1px solid var(--color-border)' }}>
          <SlotView name="footer" from="config" />
        </footer>
      )}
    </div>
  )
}
