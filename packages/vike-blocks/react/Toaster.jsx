// The React Toaster region — the rendered half of the imperative `toast` block. Mount it once (in your
// root layout); it subscribes to the agnostic toast store and renders each live toast in a fixed corner
// stack, grouped by the toast's position (or this Toaster's default). Each row plays an enter animation
// on mount (hidden frame -> reflow -> visible) and an exit when the store flags the toast `dismissed`,
// then the store hard-removes it. Portalled to <body> and gated on mount, so SSR emits nothing (no
// hydration mismatch). The stacking, card, and intent styles live in the shared toast-styles module.
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { subscribeToasts, dismissToast } from '../toast-store.js'
import { resolveToastIntent, toastRegionStyle, toastCardStyle, toastIconStyle, toastTitleStyle, toastDescStyle, toastCloseStyle, TOAST_STYLE_TAG } from '../toast-styles.js'

function ToastRow({ toast, position }) {
  const [entered, setEntered] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    void ref.current?.getBoundingClientRect() // paint the hidden "from" frame before flipping to visible
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])
  const show = entered && !toast.dismissed
  const { icon } = resolveToastIntent(toast.intent)
  return (
    <div ref={ref} role="status" aria-live="polite" style={toastCardStyle(toast.intent, { show, position })}>
      {icon != null && <span aria-hidden="true" style={toastIconStyle(toast.intent)}>{icon}</span>}
      <div style={{ minWidth: 0 }}>
        <div style={toastTitleStyle()}>{toast.message}</div>
        {toast.description != null && <div style={toastDescStyle()}>{toast.description}</div>}
      </div>
      <button type="button" className="vike-blocks-toast-close" aria-label="Dismiss" style={toastCloseStyle()} onClick={() => dismissToast(toast.id)}>
        {'×'}
      </button>
    </div>
  )
}

export function Toaster({ position = 'bottom-right' }) {
  const [items, setItems] = useState([])
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => subscribeToasts(setItems), [])
  if (!mounted) return null

  const groups = {}
  for (const t of items) {
    const pos = t.position ?? position
    ;(groups[pos] ??= []).push(t)
  }

  return createPortal(
    <>
      <style>{TOAST_STYLE_TAG}</style>
      {Object.entries(groups).map(([pos, list]) => (
        <div key={pos} data-slot="toaster" style={toastRegionStyle(pos)}>
          {list.map((t) => (
            <ToastRow key={t.id} toast={t} position={pos} />
          ))}
        </div>
      ))}
    </>,
    document.body,
  )
}
