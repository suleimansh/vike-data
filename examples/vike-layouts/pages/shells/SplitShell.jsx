// A custom app shell: a left rail (logo + vertical nav) and a right column whose main area
// is split between the page content and a trailing `aside` panel — a slot the built-in shells
// don't have. It shows the three pieces of a custom layout:
//   1. arranging the built-in slots (logo / nav / userMenu) differently from topbar/sidebar,
//   2. drawing a NEW slot (`aside`) that this shell declared via registerShell, and
//   3. adding bespoke, non-slot chrome the shell owns (the search strip below).
// Chrome comes from the config seam (<SlotView from="config" />); the page body from the
// content seam (<SlotView from="content" />) — exactly like the built-in shells.
import { SlotView } from 'vike-blocks/react/SlotView'
import { useLayoutConfig } from 'vike-blocks/react/LayoutView'

const surface = { background: 'var(--color-surface)', border: '1px solid var(--color-border)' }

export function SplitShell() {
  const { dir, logo, aside } = useLayoutConfig()
  return (
    <div dir={dir} style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)' }}>
      <aside style={{ ...surface, width: 200, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-lg, 2rem)', padding: 'var(--space-lg, 2rem)', borderInlineEnd: '1px solid var(--color-border)' }}>
        {logo && <strong><SlotView name="logo" from="config" /></strong>}
        <SlotView name="nav" from="config" vertical />
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ ...surface, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-lg, 2rem)', padding: 'var(--space-md, 1rem) var(--space-lg, 2rem)', borderBottom: '1px solid var(--color-border)' }}>
          {/* Bespoke chrome the shell owns — not a slot, just part of this layout's design. */}
          <span style={{ ...surface, borderRadius: 'var(--radius, 8px)', padding: '0.35rem 0.75rem', color: 'var(--color-muted)', fontSize: 13 }}>⌘K &nbsp;Search</span>
          <SlotView name="userMenu" from="config" />
        </header>
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          <main style={{ flex: 1, padding: 'var(--space-lg, 2rem)', minWidth: 0 }}>
            <SlotView from="content" />
          </main>
          {aside && (
            <aside style={{ ...surface, width: 240, flexShrink: 0, padding: 'var(--space-lg, 2rem)', borderInlineStart: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-muted)', marginBottom: 'var(--space-md, 1rem)' }}>Aside slot</div>
              <SlotView name="aside" from="config" />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
