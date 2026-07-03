// The shared popover primitive for React — the light sibling of the overlay primitive (overlay.jsx).
// Where the overlay is a modal (backdrop + scroll-lock + focus trap, portalled to <body>), a popover
// is a non-modal surface anchored to its trigger: no backdrop, no scroll-lock, no focus trap — it just
// closes on an outside pointer-down or Escape. It's written ONCE here so the anchored surfaces reuse
// it (date-picker first, then the dropdown/nav menus). The panel is a `position:absolute` child of a
// `position:relative` wrapper around the trigger, so it follows the trigger with no portal and no
// coordinate math (dep-free). SSR renders only the trigger (the panel is client + open-gated), so
// there's no hydration mismatch. `open`/`onClose` are owned by the consumer, exactly like the overlay.
import { useState, useRef, useEffect } from 'react'
import { POPOVER_FOCUSABLE, POPOVER_ENTER_MS, popoverAnchorStyle, resolvePlacement, popoverMaxHeight } from '../blocks/popover-styles.js'

// The lifecycle hook: owns render/visible/mounted + the reflow-driven enter, the edge-aware placement,
// the outside-pointer and Escape close, and focus (into the panel on open, restored to the trigger on
// close). `open` is the live boolean; `onClose` fires on outside-click / Escape; `requested` is the
// desired placement (flipped on open if it would overflow). Returns the render flags, the refs for the
// wrapper (rootRef) and panel (panelRef), and the resolved `placement` + `maxHeight`.
export function usePopover(open, onClose, requested = 'bottom-start') {
  const [render, setRender] = useState(open) // in the DOM (kept during the exit transition)
  const [visible, setVisible] = useState(false) // drives the enter/exit CSS
  const [mounted, setMounted] = useState(false) // client only — matches SSR (trigger-only) on first paint
  const [layout, setLayout] = useState({ placement: requested, maxHeight: null })
  const rootRef = useRef(null)
  const panelRef = useRef(null)
  const lastFocused = useRef(null)
  const exitTimer = useRef(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => () => exitTimer.current && clearTimeout(exitTimer.current), [])

  // Mount on open (cancelling a pending exit if reopened mid-close); on close, animate out then unmount.
  useEffect(() => {
    if (open) {
      if (exitTimer.current) {
        clearTimeout(exitTimer.current)
        exitTimer.current = null
      }
      if (typeof document !== 'undefined') lastFocused.current = document.activeElement
      setRender(true)
    } else if (render) {
      setVisible(false)
      exitTimer.current = setTimeout(() => setRender(false), POPOVER_ENTER_MS)
    }
  }, [open])

  // On open: measure the trigger + panel (while still hidden), flip the placement / cap the height if it
  // would overflow the viewport, THEN paint the hidden "from" frame (a reflow) and flip to visible on
  // the next frame — otherwise mount + visible land in one frame with no start state to animate from.
  useEffect(() => {
    if (!render || !open || !panelRef.current || !rootRef.current) return
    const trigger = rootRef.current.getBoundingClientRect()
    const panel = panelRef.current.getBoundingClientRect()
    const viewport = { width: window.innerWidth, height: window.innerHeight }
    const placement = resolvePlacement(requested, trigger, panel, viewport)
    setLayout({ placement, maxHeight: popoverMaxHeight(placement, trigger, viewport) })
    void panelRef.current.getBoundingClientRect()
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [render, open, requested])

  // While rendered: close on an outside pointer-down (covers mouse + touch; anywhere outside the
  // wrapper, so clicking the trigger toggles instead) or Escape. No scroll-lock and no focus trap.
  useEffect(() => {
    if (!render) return
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) onClose()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [render])

  // Move focus into the panel on open; restore it to the trigger on close.
  useEffect(() => {
    if (render && panelRef.current) {
      panelRef.current.querySelector(POPOVER_FOCUSABLE)?.focus?.()
    } else if (!render && lastFocused.current) {
      lastFocused.current.focus?.()
      lastFocused.current = null
    }
  }, [render])

  return { render, visible, mounted, rootRef, panelRef, placement: layout.placement, maxHeight: layout.maxHeight }
}

// The wrapper + anchored panel. `trigger` is the always-rendered opener (the consumer wires its own
// onClick to toggle `open`); `panelStyle(visible, placement)` is the panel's box + enter/exit transform
// (use popoverMotionStyle, plus popoverSurfaceStyle for menu-style content) — it receives the RESOLVED
// placement, which may have flipped from `placement`. The panel is capped to the available height and
// scrolls if its content is taller. Renders the panel only once mounted + in the render window, so SSR
// emits just the trigger.
export function Popover({ open, onClose, trigger, placement = 'bottom-start', role = 'dialog', labelledBy, panelStyle, children }) {
  const { render, visible, mounted, rootRef, panelRef, placement: effective, maxHeight } = usePopover(open, onClose, placement)
  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      {trigger}
      {mounted && render && (
        <div
          ref={panelRef}
          role={role}
          aria-labelledby={labelledBy}
          style={{ ...popoverAnchorStyle(effective), ...(maxHeight != null ? { maxHeight: `${maxHeight}px`, overflowY: 'auto' } : {}), ...panelStyle(visible, effective) }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
