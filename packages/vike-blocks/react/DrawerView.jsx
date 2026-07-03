// The React renderer for the `drawer` block — an edge-anchored panel with a drag-to-dismiss handle,
// built on the shared Overlay primitive (portal + focus-trap + Escape + backdrop-click + scroll-lock +
// enter/exit live there) and the sheet's edge-slide geometry (sheet-styles). Drawer adds only its
// defining affordance: a grabber you drag toward the anchored edge to flick it closed (past the
// threshold it dismisses; short of it, it snaps back). Open/close + drag are local UI state; the body
// is drawn with <Blocks>. Keyboard users close via the × button (the handle is a pointer affordance).
import { useState, useRef, useId } from 'react'
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import { Overlay, overlayTriggerStyle } from './overlay.jsx'
import { sheetContainerStyle, sheetPanelStyle } from '../blocks/sheet-styles.js'
import { dismissOffset, dismissTransform, shouldDismiss, drawerHandleStyle } from '../blocks/drawer-styles.js'

export function DrawerView({ title = '', description, trigger = 'Open', side = 'bottom', sections = [], defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const [drag, setDrag] = useState(null) // { offset } while dragging, null when resting
  const startRef = useRef(null)
  const titleId = useId()

  // While dragging, the panel follows the finger with no transition; at rest it uses the sheet's
  // resting transform + transition (so a snap-back animates).
  const panelStyle = (visible) => {
    const base = sheetPanelStyle(side, visible)
    return drag ? { ...base, transform: dismissTransform(side, drag.offset), transition: 'none' } : base
  }

  const onPointerDown = (e) => {
    startRef.current = { x: e.clientX, y: e.clientY }
    setDrag({ offset: 0 })
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    const start = startRef.current
    if (!start) return
    setDrag({ offset: dismissOffset(side, e.clientX - start.x, e.clientY - start.y) })
  }
  const onPointerUp = (e) => {
    const start = startRef.current
    startRef.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    const offset = start ? dismissOffset(side, e.clientX - start.x, e.clientY - start.y) : 0
    setDrag(null)
    if (shouldDismiss(offset)) setOpen(false)
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={overlayTriggerStyle()}>
        {trigger}
      </button>
      <Overlay
        open={open}
        onClose={() => setOpen(false)}
        labelledBy={titleId}
        role="dialog"
        containerStyle={sheetContainerStyle(side)}
        panelStyle={panelStyle}
      >
        <div
          aria-hidden="true"
          style={drawerHandleStyle(side)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 id={titleId} style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
              {title}
            </h2>
            {description && <p style={{ margin: '0.25rem 0 0', fontSize: 14, color: 'var(--color-muted, #64748b)' }}>{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            style={{ flexShrink: 0, border: 0, background: 'transparent', cursor: 'pointer', fontSize: 22, lineHeight: 1, color: 'var(--color-muted, #64748b)' }}
          >
            {'×'}
          </button>
        </header>
        {sections.length > 0 && <Blocks sections={sections} />}
      </Overlay>
    </>
  )
}

registerBlockRenderer('drawer', DrawerView)
