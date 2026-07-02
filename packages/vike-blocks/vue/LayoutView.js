// The Vue renderer for the `layout` container block — the Vue twin of react/LayoutView.jsx. A
// layout resolves to `{ variant, slots }`; this maps `variant` -> a shell and hands it the named
// regions to place. Each region is drawn with <Blocks>, so a region holds any blocks — including a
// `slot` placeholder that fills from config or the live page content (see SlotView).
//
// #401 machinery: vike-layouts' app frames (topbar/sidebar/centered) register here as `layout`
// variants, so page-structure layouts and app chrome share ONE variant dispatch and ONE
// slot/content flow. The shell registry is OPEN — registerLayoutShell(variant, component).
//
// The provided config/content are COMPUTED (reactive): Vue runs provide() once in setup, so a plain
// value would freeze at first render; a computed keeps a config-fed nav's active item and the page
// body in sync across client-side navigation. useLayoutConfig()/useLayoutContent() return the
// computed ref; read `.value`.
import { h, inject, provide, computed, unref } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import { isActivePath } from '../layout.js'

export const LAYOUT_CONFIG_KEY = Symbol.for('vike-blocks.layoutConfig')
export const useLayoutConfig = () => inject(LAYOUT_CONFIG_KEY, computed(() => ({})))

export const LAYOUT_CONTENT_KEY = Symbol.for('vike-blocks.layoutContent')
export const useLayoutContent = () => inject(LAYOUT_CONTENT_KEY, computed(() => null))

// Provide (and shallow-merge) chrome config for the layouts below it, reactively. Children go in the
// default slot: h(LayoutConfigProvider, { config }, () => ...).
export const LayoutConfigProvider = {
  props: ['config'],
  setup(props, { slots }) {
    const parent = useLayoutConfig()
    provide(
      LAYOUT_CONFIG_KEY,
      computed(() => ({ ...(unref(parent) ?? {}), ...(props.config ?? {}) })),
    )
    return () => (slots.default ? slots.default() : null)
  },
}

// A shared active-aware nav renderer: a row (or column) of { label, href, end } items, current one
// bold + aria-current, matched via isActivePath against `currentPath` from config.
export const NavRegion = {
  props: ['items', 'vertical'],
  setup(props) {
    const config = useLayoutConfig()
    return () =>
      h(
        'nav',
        { style: { display: 'flex', flexDirection: props.vertical ? 'column' : 'row', gap: 'var(--space-md, 1rem)' } },
        (props.items ?? []).map((item) => {
          const active = isActivePath(config.value?.currentPath ?? '', item.href)
          return h(
            'a',
            {
              key: item.href ?? item.label,
              href: item.href,
              'aria-current': active ? 'page' : undefined,
              style: { color: active ? 'var(--color-text)' : 'var(--color-muted)', fontWeight: active ? 600 : 400, textDecoration: 'none', fontSize: '14px' },
            },
            item.label,
          )
        }),
      )
  },
}

const region = (name, sections) => h('div', { 'data-region': name }, [h(Blocks, { sections: sections ?? [] })])

// ---- generic shells (page structure) --------------------------------------------------------

const StackShell = {
  props: ['slots'],
  setup(props) {
    return () => {
      const slots = props.slots ?? {}
      const known = ['header', 'main', 'footer']
      const names = [...known.filter((n) => slots[n]), ...Object.keys(slots).filter((n) => !known.includes(n))]
      return h('div', { 'data-slot': 'layout', 'data-variant': 'stack' }, names.map((n) => region(n, slots[n])))
    }
  },
}

const LandingShell = {
  props: ['slots'],
  setup(props) {
    return () => {
      const slots = props.slots ?? {}
      const children = []
      if (slots.header) {
        children.push(
          h(
            'header',
            { 'data-region': 'header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border, #e2e8f0)' } },
            [h(Blocks, { sections: slots.header })],
          ),
        )
      }
      children.push(h('main', { 'data-region': 'main', style: { flex: 1, maxWidth: '880px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem' } }, [h(Blocks, { sections: slots.main ?? [] })]))
      if (slots.footer) {
        children.push(
          h('footer', { 'data-region': 'footer', style: { padding: '1.5rem', borderTop: '1px solid var(--color-border, #e2e8f0)', color: 'var(--color-muted, #64748b)', fontSize: '14px' } }, [h(Blocks, { sections: slots.footer })]),
        )
      }
      return h('div', { 'data-slot': 'layout', 'data-variant': 'landing', style: { display: 'flex', flexDirection: 'column', minHeight: '100%' } }, children)
    }
  },
}

// A centered shell: optional logo over a single centered card — the public / auth default. Body is
// the `main` slot's blocks when a page composed one, else the live page content a wrapper handed in.
const CenteredShell = {
  props: ['slots'],
  setup(props) {
    const config = useLayoutConfig()
    const content = useLayoutContent()
    return () => {
      const slots = props.slots ?? {}
      const body = slots.main ? h(Blocks, { sections: slots.main }) : content.value
      const inner = []
      if (config.value?.logo) inner.push(h('div', { style: { textAlign: 'center', marginBottom: 'var(--space-lg, 2rem)', fontWeight: 700, fontSize: '20px' } }, config.value.logo))
      inner.push(h('div', { style: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius, 10px)', padding: 'var(--space-lg, 2rem)' } }, body))
      return h(
        'div',
        { 'data-slot': 'layout', 'data-variant': 'centered', style: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-sans)', padding: 'var(--space-lg, 2rem)', boxSizing: 'border-box' } },
        [h('div', { style: { width: '100%', maxWidth: '380px' } }, inner)],
      )
    }
  },
}

// variant -> shell. Open: register via registerLayoutShell (vike-layouts adds its app frames) or
// pass `shells` per call. A later registration wins.
const SHELLS = new Map([
  ['stack', StackShell],
  ['landing', LandingShell],
  ['centered', CenteredShell],
])

export function registerLayoutShell(variant, component) {
  if (typeof variant !== 'string' || !variant) throw new Error('registerLayoutShell: a non-empty variant name is required')
  if (!component || (typeof component !== 'object' && typeof component !== 'function')) throw new Error(`registerLayoutShell(${JSON.stringify(variant)}): component must be a Vue component`)
  SHELLS.set(variant, component)
  return component
}

export const LayoutView = {
  props: ['variant', 'slots', 'shells', 'content'],
  setup(props) {
    // Provide the live page body (reactive) to descendant slot(from:'content') placeholders.
    provide(
      LAYOUT_CONTENT_KEY,
      computed(() => props.content ?? null),
    )
    return () => {
      const map = { ...Object.fromEntries(SHELLS), ...(props.shells ?? {}) }
      const Shell = map[props.variant ?? 'stack'] || StackShell
      return h(Shell, { slots: props.slots ?? {} })
    }
  },
}

registerBlockRenderer('layout', LayoutView)
