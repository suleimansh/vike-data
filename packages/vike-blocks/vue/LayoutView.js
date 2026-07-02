// The Vue renderer for the `layout` container block — the Vue twin of react/LayoutView.jsx. A
// layout resolves to `{ variant, slots }`; this maps `variant` -> a shell and hands it the named
// regions to place, each drawn with <Blocks>. The shell map is OPEN (pass `shells` to add a
// variant), mirroring vike-layouts' shell registry. Theme-native (vike-themes CSS vars),
// dep-free. A region can hold a `slot` placeholder that fills from config (see SlotView).
import { h, inject, provide } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'

// The cumulative layout-chrome config (nav / toolbar contributions) a `slot(...).from('config')`
// reads at render time — the Vue twin of React's LayoutConfigContext, via provide/inject. Empty by
// default so a config slot with no contribution renders empty.
export const LAYOUT_CONFIG_KEY = Symbol.for('vike-blocks.layoutConfig')
export const useLayoutConfig = () => inject(LAYOUT_CONFIG_KEY, {})

// Provide (and shallow-merge) chrome config for the layouts below it. Nesting merges, so one
// provider can set `nav` and a deeper one add `toolbar` without clobbering. Children go in the
// default slot: h(LayoutConfigProvider, { config }, () => h(Blocks, { sections })).
export const LayoutConfigProvider = {
  props: ['config'],
  setup(props, { slots }) {
    const parent = useLayoutConfig()
    provide(LAYOUT_CONFIG_KEY, { ...parent, ...(props.config ?? {}) })
    return () => (slots.default ? slots.default() : null)
  },
}

const region = (name, sections) => h('div', { 'data-region': name }, [h(Blocks, { sections: sections ?? [] })])

// The neutral shell: stack the regions in a stable order (header, main, footer, then any extras in
// insertion order). The safe default when a variant has no shell.
function stackShell(slots) {
  const known = ['header', 'main', 'footer']
  const names = [...known.filter((n) => slots[n]), ...Object.keys(slots).filter((n) => !known.includes(n))]
  return h('div', { 'data-slot': 'layout', 'data-variant': 'stack' }, names.map((n) => region(n, slots[n])))
}

// A landing shell: header bar, wide centered main, muted footer. Themed on the var(--color-*)
// contract. A swappable variant over the same { header, main, footer } regions.
function landingShell(slots) {
  const children = []
  if (slots.header) {
    children.push(
      h(
        'header',
        {
          'data-region': 'header',
          style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border, #e2e8f0)' },
        },
        [h(Blocks, { sections: slots.header })],
      ),
    )
  }
  children.push(
    h('main', { 'data-region': 'main', style: { flex: 1, maxWidth: '880px', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem' } }, [h(Blocks, { sections: slots.main ?? [] })]),
  )
  if (slots.footer) {
    children.push(
      h('footer', { 'data-region': 'footer', style: { padding: '1.5rem', borderTop: '1px solid var(--color-border, #e2e8f0)', color: 'var(--color-muted, #64748b)', fontSize: '14px' } }, [
        h(Blocks, { sections: slots.footer }),
      ]),
    )
  }
  return h('div', { 'data-slot': 'layout', 'data-variant': 'landing', style: { display: 'flex', flexDirection: 'column', minHeight: '100%' } }, children)
}

// A centered shell: a single centered card, logo/main only — mirrors vike-layouts' `centered`.
function centeredShell(slots) {
  const inner = []
  if (slots.header) inner.push(h('div', { 'data-region': 'header', style: { textAlign: 'center', marginBottom: '1.5rem' } }, [h(Blocks, { sections: slots.header })]))
  inner.push(
    h('div', { 'data-region': 'main', style: { border: '1px solid var(--color-border, #e2e8f0)', borderRadius: 'var(--radius, 12px)', background: 'var(--color-surface, #fff)', padding: '1.5rem' } }, [
      h(Blocks, { sections: slots.main ?? [] }),
    ]),
  )
  return h('div', { 'data-slot': 'layout', 'data-variant': 'centered', style: { display: 'grid', placeItems: 'center', minHeight: '100%', padding: '2rem' } }, [
    h('div', { style: { width: '100%', maxWidth: '420px' } }, inner),
  ])
}

// variant -> shell. Open like vike-layouts' SHELLS: an app adds a variant by passing `shells`.
const BUILTIN_SHELLS = { stack: stackShell, landing: landingShell, centered: centeredShell }

export const LayoutView = {
  props: ['variant', 'slots', 'shells'],
  setup(props) {
    return () => {
      const map = { ...BUILTIN_SHELLS, ...(props.shells ?? {}) }
      const shell = map[props.variant ?? 'stack'] || stackShell
      return shell(props.slots ?? {})
    }
  },
}

registerBlockRenderer('layout', LayoutView)
