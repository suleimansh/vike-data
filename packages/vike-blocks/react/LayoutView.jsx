// The React renderer for the `layout` container block. A layout resolves to `{ variant, slots }`
// where each slot is a resolved section array; this maps `variant` -> a shell component and hands
// it the named regions to place. Each region is drawn with <Blocks>, so a region holds any blocks
// — including a `slot` placeholder that fills from config or the live page content (see SlotView).
//
// This is the #401 machinery: vike-layouts' app frames (topbar/sidebar/centered) register here as
// `layout` variants, so page-structure layouts and app chrome go through ONE variant dispatch and
// ONE slot/content flow. The shell registry is OPEN — `registerLayoutShell(variant, component)`
// adds one (how vike-layouts contributes its frames), or pass `shells` per call.
import { createContext, useContext } from 'react'
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import { isActivePath } from '../blocks/layout.js'
import { stackRegionOrder } from '../core/view-helpers.js'

// The cumulative layout-chrome config (nav / logo / userMenu / footer / toolbar / currentPath) a
// `slot(...).from('config')` reads at render time. A provider merges each extension's contribution,
// so chrome composes by SEAM (not by inlining into a page). `currentPath` is passed in as data so a
// config nav highlights the active item without any vike dependency here.
export const LayoutConfigContext = createContext({})
export const useLayoutConfig = () => useContext(LayoutConfigContext)

// The live page body a `slot(...).from('content')` renders — the thing an app frame wraps. Supplied
// by a page wrapper (vike-layouts' ConfigLayout) via LayoutView's `content` prop.
export const LayoutContentContext = createContext(null)
export const useLayoutContent = () => useContext(LayoutContentContext)

// Provide (and shallow-merge) chrome config for the layouts below it. Nesting merges, so one
// provider can set `nav` and a deeper one add `toolbar` without clobbering.
export function LayoutConfigProvider({ config = {}, children }) {
  const parent = useLayoutConfig()
  return <LayoutConfigContext.Provider value={{ ...parent, ...config }}>{children}</LayoutConfigContext.Provider>
}

// A shared active-aware nav renderer for the config-fed nav slot and the app shells: a row (or
// column) of { label, href, end } items, the current one bold + aria-current. The active match is
// the agnostic isActivePath against `currentPath` from the config context.
export function NavRegion({ items = [], vertical = false }) {
  const { currentPath = '' } = useLayoutConfig()
  return (
    <nav style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 'var(--space-md, 1rem)' }}>
      {items.map((item) => {
        const active = isActivePath(currentPath, item.href)
        return (
          <a
            key={item.href ?? item.label}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            style={{ color: active ? 'var(--color-text)' : 'var(--color-muted)', fontWeight: active ? 600 : 400, textDecoration: 'none', fontSize: 14 }}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}

// Draw one named region's resolved sections.
function Region({ sections }) {
  return <Blocks sections={sections ?? []} />
}

// ---- generic shells (page structure) --------------------------------------------------------

// The neutral shell: stack the regions in a stable order (header, main, footer, then extras).
function StackShell({ slots }) {
  const names = stackRegionOrder(slots)
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

// A landing shell: header bar, wide centered main, muted footer.
function LandingShell({ slots }) {
  return (
    <div data-slot="layout" data-variant="landing" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {slots.header && (
        <header
          data-region="header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border, #e2e8f0)' }}
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

// A centered shell: an optional logo over a single centered card — the public / auth default
// (vike-auth's login uses it). The card body is the `main` slot's blocks when a page composed one,
// otherwise the live page content a wrapper handed in (from:'content') — so the same shell serves a
// hand-authored `layout('centered')` block AND vike-layouts wrapping a page. Logo comes from config.
function CenteredShell({ slots }) {
  const { logo } = useLayoutConfig()
  const content = useLayoutContent()
  const body = slots.main ? <Region sections={slots.main} /> : content
  return (
    <div data-slot="layout" data-variant="centered" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', padding: 'var(--space-lg, 2rem)', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {logo && <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg, 2rem)', fontWeight: 700, fontSize: 20 }}>{logo}</div>}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius, 10px)', padding: 'var(--space-lg, 2rem)' }}>{body}</div>
      </div>
    </div>
  )
}

// variant -> shell. Open: register via registerLayoutShell (vike-layouts adds its app frames) or
// pass `shells` per call. A later registration wins, so an extension can override a builtin.
const SHELLS = new Map([
  ['stack', StackShell],
  ['landing', LandingShell],
  ['centered', CenteredShell],
])

export function registerLayoutShell(variant, component) {
  if (typeof variant !== 'string' || !variant) throw new Error('registerLayoutShell: a non-empty variant name is required')
  if (typeof component !== 'function') throw new Error(`registerLayoutShell(${JSON.stringify(variant)}): component must be a function`)
  SHELLS.set(variant, component)
  return component
}

export function LayoutView({ variant = 'stack', slots = {}, shells = {}, content = null }) {
  const map = { ...Object.fromEntries(SHELLS), ...shells }
  const Shell = map[variant] || StackShell
  // Provide the live page body to descendant `slot(from:'content')` placeholders; the shell places
  // it via <SlotView from="content" /> in whichever region it belongs.
  return (
    <LayoutContentContext.Provider value={content}>
      <Shell slots={slots} />
    </LayoutContentContext.Provider>
  )
}

registerBlockRenderer('layout', LayoutView)
