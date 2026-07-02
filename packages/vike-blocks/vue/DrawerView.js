// The Vue renderer for the `drawer` block — the Vue twin of react/DrawerView.jsx, an edge-anchored
// panel with a drag-to-dismiss handle, built on the shared Overlay primitive and the sheet's edge-slide
// geometry (sheet-styles). Drawer adds only its grabber affordance: drag it toward the anchored edge to
// flick it closed (past the threshold it dismisses; short of it, it snaps back). Open/close + drag are
// local UI state; the body is drawn with <Blocks>. Keyboard users close via the × button.
import { h, ref } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import { Overlay, overlayTriggerStyle } from './overlay.js'
import { sheetContainerStyle, sheetPanelStyle } from '../sheet-styles.js'
import { dismissOffset, dismissTransform, shouldDismiss, drawerHandleStyle } from '../drawer-styles.js'

let uid = 0

export const DrawerView = {
  props: ['title', 'description', 'trigger', 'side', 'sections', 'defaultOpen'],
  setup(props) {
    const open = ref(!!props.defaultOpen)
    const drag = ref(null) // { offset } while dragging, null when resting
    let start = null
    const titleId = `vike-blocks-drawer-${uid++}`

    return () => {
      const sections = props.sections ?? []
      const side = props.side ?? 'bottom'

      // While dragging, the panel follows the finger with no transition; at rest it uses the sheet's
      // resting transform + transition (so a snap-back animates).
      const panelStyle = (visible) => {
        const base = sheetPanelStyle(side, visible)
        return drag.value ? { ...base, transform: dismissTransform(side, drag.value.offset), transition: 'none' } : base
      }

      const onPointerDown = (e) => {
        start = { x: e.clientX, y: e.clientY }
        drag.value = { offset: 0 }
        e.currentTarget.setPointerCapture?.(e.pointerId)
      }
      const onPointerMove = (e) => {
        if (!start) return
        drag.value = { offset: dismissOffset(side, e.clientX - start.x, e.clientY - start.y) }
      }
      const onPointerUp = (e) => {
        const s = start
        start = null
        e.currentTarget.releasePointerCapture?.(e.pointerId)
        const offset = s ? dismissOffset(side, e.clientX - s.x, e.clientY - s.y) : 0
        drag.value = null
        if (shouldDismiss(offset)) open.value = false
      }

      const triggerBtn = h('button', { type: 'button', onClick: () => (open.value = true), style: overlayTriggerStyle() }, props.trigger ?? 'Open')

      const handle = h('div', {
        'aria-hidden': 'true',
        style: drawerHandleStyle(side),
        onPointerdown: onPointerDown,
        onPointermove: onPointerMove,
        onPointerup: onPointerUp,
        onPointercancel: onPointerUp,
      })

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

      const panelChildren = [handle, header, sections.length > 0 ? h(Blocks, { sections }) : null]

      const overlay = h(
        Overlay,
        {
          open: open.value,
          onClose: () => (open.value = false),
          labelledBy: titleId,
          role: 'dialog',
          containerStyle: sheetContainerStyle(side),
          panelStyle,
        },
        { default: () => panelChildren },
      )

      return h('span', { 'data-slot': 'drawer' }, [triggerBtn, overlay])
    }
  },
}

registerBlockRenderer('drawer', DrawerView)
