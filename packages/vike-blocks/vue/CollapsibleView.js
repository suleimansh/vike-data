// The Vue renderer for the `collapsible` block — the Vue twin of react/CollapsibleView.jsx, a single
// expand/collapse disclosure (the accordion's single-panel sibling). Theme-native, with the same
// pure-CSS height morph (the panel measured, then transitioned 0 <-> px) and fade. A closed panel is
// seeded to 0 before first render so it doesn't flash open then snap shut. Open/closed is local UI
// state; the panel's resolved blocks are drawn with <Blocks>. Zero animation dependency.
import { h, ref, nextTick, onMounted } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'

const chevron = (open) =>
  h(
    'svg',
    {
      'aria-hidden': 'true',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      style: { flexShrink: 0, transition: 'transform 0.25s ease', transform: open ? 'rotate(180deg)' : 'none' },
    },
    [h('polyline', { points: '6 9 12 15 18 9' })],
  )

export const CollapsibleView = {
  props: ['label', 'open', 'sections'],
  setup(props) {
    const open = ref(!!props.open)
    // Seed a CLOSED panel to 0 before the first render (an open one stays `auto` until measured), so a
    // closed collapsible renders collapsed from first paint instead of flashing its content then snapping.
    const height = ref(open.value ? null : 0)
    let contentEl = null

    const measure = () => {
      if (contentEl) height.value = open.value ? contentEl.offsetHeight : 0
    }
    onMounted(() => nextTick(measure))

    const toggle = () => {
      open.value = !open.value
      nextTick(measure)
    }

    return () => {
      const header = h(
        'button',
        {
          type: 'button',
          'aria-expanded': open.value,
          onClick: toggle,
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: '0.75rem',
            padding: '0.75rem 0.9rem',
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 600,
            textAlign: 'left',
            color: 'var(--color-text, #0f172a)',
          },
        },
        [h('span', props.label ?? ''), chevron(open.value)],
      )

      const panel = h(
        'div',
        { style: { overflow: 'hidden', transition: 'height 0.28s ease', height: height.value != null ? `${height.value}px` : 'auto' } },
        [
          h(
            'div',
            {
              ref: (el) => (contentEl = el),
              role: 'region',
              style: { opacity: open.value ? 1 : 0, transition: 'opacity 0.28s ease', padding: '0 0.9rem 0.85rem' },
            },
            h(Blocks, { sections: props.sections ?? [] }),
          ),
        ],
      )

      return h(
        'div',
        { 'data-slot': 'collapsible', style: { margin: '0.75rem 0', border: '1px solid var(--color-border, #e2e8f0)', borderRadius: 'var(--radius, 8px)', overflow: 'hidden' } },
        [header, panel],
      )
    }
  },
}

registerBlockRenderer('collapsible', CollapsibleView)
