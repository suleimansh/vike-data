// The React Toaster region — the rendered half of the imperative `toast` block, a Sonner-style deck.
// Mount it once (in your root layout); it subscribes to the agnostic toast store and renders each live
// toast in a fixed corner, stacked on top of each other. Collapsed (default) the toasts behind the
// front peek out scaled + offset; on hover the deck expands into a readable list. Each row measures its
// own height (so the expanded spread is exact) and plays an enter animation on mount / an exit when the
// store flags it `dismissed`. Portalled to <body> and gated on mount, so SSR emits nothing. The deck
// math + card styles live in the shared toast-styles module, so this stays a thin binding.
import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { subscribeToasts, dismissToast } from '../blocks/toast-store.js'
import {
  resolveToastIntent,
  toastRegionStyle,
  toastStackStyle,
  toastDeckExtent,
  toastDeckOffsets,
  toastCardStyle,
  toastIconStyle,
  toastTitleStyle,
  toastDescStyle,
  toastCloseStyle,
  toastSwipeOffset,
  toastShouldDismiss,
  TOAST_VISIBLE,
  TOAST_GAP,
  TOAST_STYLE_TAG,
} from '../blocks/toast-styles.js'

function ToastRow({ toast, side, index, total, expanded, heightsInFront, hidden, onMeasure, onDragChange }) {
  const [entered, setEntered] = useState(false)
  const [drag, setDrag] = useState(0) // px swiped toward the edge; 0 = not dragging
  const startRef = useRef(null)
  const ref = useRef(null)
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true)) // flip to visible next frame -> enter animates
    return () => cancelAnimationFrame(id)
  }, [])
  // Report the measured height on every render so the deck's expanded spread stays exact (descriptions
  // make toasts taller). useLayoutEffect measures before paint, so there's no visible jump.
  useLayoutEffect(() => {
    if (ref.current) onMeasure(toast.id, ref.current.offsetHeight)
  })
  // Swipe to dismiss: track the pointer, follow the finger toward the edge, flick closed past the
  // threshold (else snap back). Skip the close button so its click still lands.
  const onPointerDown = (e) => {
    if (e.button !== 0 || e.target.closest('button')) return
    startRef.current = { x: e.clientX, y: e.clientY }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    onDragChange(true)
  }
  const onPointerMove = (e) => {
    if (startRef.current) setDrag(toastSwipeOffset(side, e.clientY - startRef.current.y))
  }
  const onPointerUp = (e) => {
    const start = startRef.current
    if (!start) return
    startRef.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    setDrag(0)
    onDragChange(false)
    if (toastShouldDismiss(toastSwipeOffset(side, e.clientY - start.y))) dismissToast(toast.id)
  }
  const show = entered && !toast.dismissed
  const { icon } = resolveToastIntent(toast.intent)
  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      style={{ ...toastCardStyle(toast.intent), ...toastStackStyle({ index, total, side, expanded, heightsInFront, hidden, show, drag }) }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
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

function ToastRegion({ position, toasts }) {
  const [side] = position.split('-')
  const [expanded, setExpanded] = useState(false)
  const [dragging, setDragging] = useState(false) // a row is mid-swipe: don't let the deck collapse under it
  const [heights, setHeights] = useState({}) // toast id -> measured px
  const onMeasure = (id, h) => setHeights((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }))

  const ordered = [...toasts].reverse() // newest first = the front of the deck
  const hOf = (t) => heights[t.id] ?? 64 // a sane default until the first measure lands
  const inFront = toastDeckOffsets(ordered, hOf, TOAST_GAP) // height (+gap) in front of each toast
  const extent = toastDeckExtent(ordered.map(hOf), expanded)

  return (
    <div
      data-slot="toaster"
      style={toastRegionStyle(position, extent)}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => {
        if (!dragging) setExpanded(false)
      }}
      onFocusCapture={() => setExpanded(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setExpanded(false)
      }}
    >
      {ordered.map((t, i) => (
        <ToastRow
          key={t.id}
          toast={t}
          side={side}
          index={i}
          total={ordered.length}
          expanded={expanded}
          heightsInFront={inFront[i]}
          hidden={!expanded && i >= TOAST_VISIBLE}
          onMeasure={onMeasure}
          onDragChange={setDragging}
        />
      ))}
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
        <ToastRegion key={pos} position={pos} toasts={list} />
      ))}
    </>,
    document.body,
  )
}
