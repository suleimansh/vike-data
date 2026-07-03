// The shared overlay primitive for Vue — the Vue twin of react/overlay.jsx. The dep-free portal +
// lifecycle machinery every modal surface (dialog, sheet, drawer, and later the popover-anchored
// menus) reuses, so it's written ONCE. It does the portal (Teleport to <body>), backdrop, focus trap
// (Tab cycles inside the panel), Escape + backdrop-click to close, body scroll-lock, and the enter/exit
// lifecycle (mount -> paint the hidden "from" frame -> flip to visible; animate out then unmount). It
// is UNSTYLED beyond the backdrop: the consumer supplies the panel position + enter/exit transform via
// `panelStyle(visible)` and the backdrop alignment via `containerStyle`.
import { h, ref, watch, onMounted, onUnmounted, nextTick, toRef, Teleport } from 'vue'
import { OVERLAY_ENTER_MS, OVERLAY_EASE, OVERLAY_BACKDROP_EASE } from '../core/overlay-motion.js'

export const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
// Re-exported from the shared overlay-motion source so dialog / sheet / drawer all animate identically.
export const ENTER_MS = OVERLAY_ENTER_MS
export const SPRING = OVERLAY_EASE

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

// The lifecycle composable: owns render/visible/mounted + the reflow-driven enter, the focus trap,
// Escape, scroll-lock, and focus restore. `open` is a ref to the live boolean; `onClose` is called on
// Escape/backdrop. Returns the flags the panel renders from and the ref to attach to the panel element.
export function useOverlay(open, onClose) {
  const render = ref(open.value) // in the DOM (kept during the exit transition)
  const visible = ref(false) // drives the enter/exit CSS
  const mounted = ref(false) // client only — the Teleport target exists after mount
  const popupEl = ref(null)
  const lastFocused = ref(null)
  let exitTimer = null

  onMounted(() => (mounted.value = true))

  const trapAndClose = (e) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key !== 'Tab' || !popupEl.value) return
    const nodes = Array.from(popupEl.value.querySelectorAll(FOCUSABLE))
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

  let prevOverflow = ''
  const lock = () => {
    document.addEventListener('keydown', trapAndClose)
    prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  const unlock = () => {
    document.removeEventListener('keydown', trapAndClose)
    document.body.style.overflow = prevOverflow
  }

  // Once the panel is in the DOM: lock + focus, paint the hidden "from" frame (a reflow), then flip to
  // visible on the next frame — otherwise mount + visible land in one frame with no start state to
  // animate from (which is why, done naively, only the exit animates).
  const enter = () =>
    nextTick(() => {
      lock()
      if (popupEl.value) void popupEl.value.getBoundingClientRect()
      requestAnimationFrame(() => (visible.value = true))
      const first = popupEl.value?.querySelector(FOCUSABLE)
      ;(first ?? popupEl.value)?.focus?.()
    })

  watch(open, (isOpen) => {
    if (exitTimer) {
      clearTimeout(exitTimer)
      exitTimer = null
    }
    if (isOpen) {
      lastFocused.value = document.activeElement
      render.value = true
      enter()
    } else {
      visible.value = false
      unlock()
      lastFocused.value?.focus?.()
      lastFocused.value = null
      exitTimer = setTimeout(() => (render.value = false), ENTER_MS)
    }
  })

  onMounted(() => {
    if (open.value) enter()
  })
  onUnmounted(() => {
    if (exitTimer) clearTimeout(exitTimer)
    unlock()
  })

  return { render, visible, mounted, popupEl }
}

// The portal + backdrop + panel wrapper. `containerStyle` positions the panel within the backdrop;
// `panelStyle(visible)` is the panel's own box + enter/exit transform. Renders nothing until mounted +
// in the render window, so SSR emits no overlay (the trigger stays the only server output).
export const Overlay = {
  props: ['open', 'onClose', 'labelledBy', 'role', 'containerStyle', 'panelStyle'],
  setup(props, { slots }) {
    const openRef = toRef(props, 'open')
    const close = () => props.onClose?.()
    const { render, visible, mounted, popupEl } = useOverlay(openRef, close)
    return () => {
      if (!(mounted.value && render.value)) return null
      const panel = h(
        'div',
        {
          ref: popupEl,
          role: props.role ?? 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': props.labelledBy,
          tabindex: '-1',
          onClick: (e) => e.stopPropagation(),
          style: props.panelStyle(visible.value),
        },
        slots.default?.(),
      )
      const overlay = h(
        'div',
        {
          role: 'presentation',
          onClick: close,
          style: {
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.5)',
            opacity: visible.value ? 1 : 0,
            transition: `opacity ${ENTER_MS}ms ${OVERLAY_BACKDROP_EASE}`,
            ...props.containerStyle,
          },
        },
        panel,
      )
      return h(Teleport, { to: 'body' }, overlay)
    }
  },
}
