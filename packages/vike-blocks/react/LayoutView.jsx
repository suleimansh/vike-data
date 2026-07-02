// The React renderer for the `layout` container block. A layout resolves to `{ variant, slots }`
// where each slot is a resolved section array; this maps `variant` -> a shell component and hands
// it the named regions to place. The shell map is OPEN, exactly like vike-layouts' shell registry:
// pass `shells` (or register app-wide) to add a variant. Each region is drawn with <Blocks>, so a
// region holds any blocks — including a `slot` placeholder that fills from config (see SlotView).
//
// This is the #401 proof on the render side: vike-layouts' shells become `layout`-block variants,
// and a page's structure is one block IR with a swappable implementation per variant.
import { createContext, useContext } from 'react'
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'

// The cumulative layout-chrome config (nav / toolbar contributions) a `slot(...).from('config')`
// reads at render time. Mirrors vike-layouts reading the resolved layout config off pageContext:
// a provider merges each extension's contribution, so chrome composes by SEAM (not by inlining a
// nav item into every page). Empty by default so a config slot with no contribution renders empty.
export const LayoutConfigContext = createContext({})
export const useLayoutConfig = () => useContext(LayoutConfigContext)

// Provide (and shallow-merge) chrome config for the layouts below it. Nesting merges, so one
// provider can set `nav` and a deeper one add `toolbar` without clobbering.
export function LayoutConfigProvider({ config = {}, children }) {
  const parent = useLayoutConfig()
  return <LayoutConfigContext.Provider value={{ ...parent, ...config }}>{children}</LayoutConfigContext.Provider>
}

// Draw one named region's resolved sections. A tiny wrapper so shells stay declarative.
function Region({ sections }) {
  return <Blocks sections={sections ?? []} />
}

// The neutral shell: stack the regions in a stable order (header, main, footer, then any extras in
// insertion order), each in its own labelled block. The safe default when a variant has no shell.
function StackShell({ slots }) {
  const known = ['header', 'main', 'footer']
  const names = [...known.filter((n) => slots[n]), ...Object.keys(slots).filter((n) => !known.includes(n))]
  return (
    <div data-slot="layout" data-variant="stack">
      {names.map((name) => (
        <div key={name} data-region={name}>
          <Region sections={slots[name]} />
        </div>
      ))}
    </div>
  )
}

// A landing shell: a centered column with a header bar, a wide main, and a muted footer. Themed on
// the var(--color-*) contract so a theme restyles it for free. Demonstrates a SWAPPABLE variant
// over the same { header, main, footer } regions StackShell renders.
function LandingShell({ slots }) {
  return (
    <div data-slot="layout" data-variant="landing" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {slots.header && (
        <header
          data-region="header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
          }}
        >
          <Region sections={slots.header} />
        </header>
      )}
      <main data-region="main" style={{ flex: 1, maxWidth: 880, width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <Region sections={slots.main} />
      </main>
      {slots.footer && (
        <footer
          data-region="footer"
          style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border, #e2e8f0)', color: 'var(--color-muted, #64748b)', fontSize: 14 }}
        >
          <Region sections={slots.footer} />
        </footer>
      )}
    </div>
  )
}

// A centered shell: a single centered card, logo/main only — the public/auth default, mirroring
// vike-layouts' `centered` shell as a layout-block variant.
function CenteredShell({ slots }) {
  return (
    <div data-slot="layout" data-variant="centered" style={{ display: 'grid', placeItems: 'center', minHeight: '100%', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {slots.header && (
          <div data-region="header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <Region sections={slots.header} />
          </div>
        )}
        <div
          data-region="main"
          style={{
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: 'var(--radius, 12px)',
            background: 'var(--color-surface, #fff)',
            padding: '1.5rem',
          }}
        >
          <Region sections={slots.main} />
        </div>
      </div>
    </div>
  )
}

// variant -> shell. Open like vike-layouts' SHELLS: an app adds a variant by passing `shells`.
const BUILTIN_SHELLS = { stack: StackShell, landing: LandingShell, centered: CenteredShell }

export function LayoutView({ variant = 'stack', slots = {}, shells = {} }) {
  const map = { ...BUILTIN_SHELLS, ...shells }
  const Shell = map[variant] || StackShell
  return <Shell slots={slots} />
}

registerBlockRenderer('layout', LayoutView)
