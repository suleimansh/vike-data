// The Vue renderer for the `sheet` block — the Vue twin of react/SheetView.jsx, an edge-anchored side
// panel built on the shared Overlay primitive (portal + focus-trap + Escape + backdrop-click +
// scroll-lock + enter/exit live there, so sheet/dialog/drawer can't drift). Sheet supplies only the
// edge-anchored backdrop alignment and the slide-in transform (from sheet-styles, by side), plus the
// header + body. Theme-native; the body is drawn with <Blocks>.
import { h, ref } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import { Overlay, overlayTriggerStyle } from './overlay.js'
import { sheetContainerStyle, sheetPanelStyle } from '../blocks/sheet-styles.js'

let uid = 0

export const SheetView = {
  props: ['title', 'description', 'trigger', 'side', 'sections', 'defaultOpen'],
  setup(props) {
    const open = ref(!!props.defaultOpen)
    const titleId = `vike-blocks-sheet-${uid++}`

    return () => {
      const sections = props.sections ?? []
      const side = props.side ?? 'right'

      const triggerBtn = h('button', { type: 'button', onClick: () => (open.value = true), style: overlayTriggerStyle() }, props.trigger ?? 'Open')

      const header = h('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' } }, [
        h('div', [
          h('h2', { id: titleId, style: { margin: 0, fontSize: '18px', fontWeight: 600 } }, props.title ?? ''),
          props.description ? h('p', { style: { margin: '0.25rem 0 0', fontSize: '14px', color: 'var(--color-muted, #64748b)' } }, props.description) : null,
        ]),
        h(
          'button',
          {
            type: 'button',
            'aria-label': 'Close',
            onClick: () => (open.value = false),
            style: { flexShrink: 0, border: 0, background: 'transparent', cursor: 'pointer', fontSize: '22px', lineHeight: 1, color: 'var(--color-muted, #64748b)' },
          },
          '×',
        ),
      ])

      const panelChildren = [header, sections.length > 0 ? h(Blocks, { sections }) : null]

      const overlay = h(
        Overlay,
        {
          open: open.value,
          onClose: () => (open.value = false),
          labelledBy: titleId,
          role: 'dialog',
          containerStyle: sheetContainerStyle(side),
          panelStyle: (visible) => sheetPanelStyle(side, visible),
        },
        { default: () => panelChildren },
      )

      return h('span', { 'data-slot': 'sheet' }, [triggerBtn, overlay])
    }
  },
}

registerBlockRenderer('sheet', SheetView)
