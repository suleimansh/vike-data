// The shared overlay primitive for React — the dep-free portal + lifecycle machinery that every modal
// surface (dialog, sheet, drawer, and later the popover-anchored menus) reuses, so it's written and
// hardened ONCE. It does what Animate UI leans on Base UI for: a portal to <body>, a backdrop, a focus
// trap (Tab cycles inside the panel), Escape + backdrop-click to close, body scroll-lock, and the
// enter/exit lifecycle (mount -> paint the hidden "from" frame -> flip to visible; animate out then
// unmount). It is UNSTYLED beyond the backdrop: the consumer supplies the panel position + enter/exit
// transform via `panelStyle(visible)` and the backdrop alignment via `containerStyle`, so a centered
// dialog and an edge-anchored sheet share all the behavior and differ only in those two knobs.
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { OVERLAY_ENTER_MS, OVERLAY_BACKDROP_EASE, FOCUSABLE } from '../core/overlay-motion.js'

// Re-exported from the shared overlay-motion source so dialog / sheet / drawer share one focus set + timing.
export { FOCUSABLE }
export const ENTER_MS = OVERLAY_ENTER_MS

// The shared trigger-button look, so every overlay's opener is identical.
export const overlayTriggerStyle = () => ({
  display: 'inline-block',
  padding: '0.5rem 0.9rem',
  border: '1px solid var(--color-border, #e2e8f0)',
  borderRadius: 'var(--radius, 8px)',
  background: 'var(--color-surface, #f1f5f9)',
  color: 'var(--color-text, #0f172a)',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
})

// The lifecycle hook: owns render/visible/mounted + the reflow-driven enter, the focus trap, Escape,
// scroll-lock, and focus restore. `open` is the live boolean; `onClose` is called on Escape/backdrop.
// Returns the flags the panel renders from and the ref to attach to the panel element.
export function useOverlay(open, onClose) {
  const [render, setRender] = useState(open) // in the DOM (kept during the exit transition)
  const [visible, setVisible] = useState(false) // drives the enter/exit CSS
  const [mounted, setMounted] = useState(false) // client only — the portal target exists after mount
  const popupRef = useRef(null)
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
      exitTimer.current = setTimeout(() => setRender(false), ENTER_MS)
    }
  }, [open])

  // Run the ENTER transition: paint the hidden "from" frame (a reflow), THEN flip to visible on the
  // next frame — otherwise mount + visible land in one frame and there is no start state to animate
  // from (which is why, done naively, only the exit animates).
  useEffect(() => {
    if (!render || !open || !popupRef.current) return
    void popupRef.current.getBoundingClientRect()
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [render, open])

  // While mounted: trap Tab inside the panel, close on Escape, and lock body scroll.
  useEffect(() => {
    if (!render) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !popupRef.current) return
      const nodes = Array.from(popupRef.current.querySelectorAll(FOCUSABLE))
      if (nodes.length === 0) {
        e.preventDefault()
        return
      }
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [render])

  // Move focus into the panel on open; restore it to the trigger on close.
  useEffect(() => {
    if (render && popupRef.current) {
      const first = popupRef.current.querySelector(FOCUSABLE)
      ;(first ?? popupRef.current).focus()
    } else if (!render && lastFocused.current) {
      lastFocused.current.focus?.()
      lastFocused.current = null
    }
  }, [render])

  return { render, visible, mounted, popupRef }
}

// The portal + backdrop + panel wrapper. `containerStyle` positions the panel within the backdrop
// (center for a dialog, an edge for a sheet); `panelStyle(visible)` is the panel's own box + enter/exit
// transform. Renders nothing until mounted + in the render window, so SSR emits no overlay (the trigger
// stays the only server output — no hydration mismatch).
export function Overlay({ open, onClose, labelledBy, role = 'dialog', containerStyle, panelStyle, children }) {
  const { render, visible, mounted, popupRef } = useOverlay(open, onClose)
  if (!(mounted && render)) return null
  const overlay = (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        background: 'rgba(15, 23, 42, 0.5)',
        opacity: visible ? 1 : 0,
        transition: `opacity ${ENTER_MS}ms ${OVERLAY_BACKDROP_EASE}`,
        ...containerStyle,
      }}
    >
      <div
        ref={popupRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={panelStyle(visible)}
      >
        {children}
      </div>
    </div>
  )
  return createPortal(overlay, document.body)
}
