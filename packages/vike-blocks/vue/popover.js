// The shared popover primitive for Vue — the Vue twin of react/popover.jsx, the light sibling of the
// overlay primitive (vue/overlay.js). Where the overlay is a modal (backdrop + scroll-lock + focus
// trap, Teleport to <body>), a popover is a non-modal surface anchored to its trigger: no backdrop, no
// scroll-lock, no focus trap — it just closes on an outside pointer-down or Escape. Written ONCE so the
// anchored surfaces reuse it (date-picker first, then the dropdown/nav menus). The panel is a
// `position:absolute` child of a `position:relative` wrapper around the trigger, so it follows the
// trigger with no portal and no coordinate math (dep-free). SSR renders only the trigger (the panel is
// client + open-gated), so there's no hydration mismatch. `open`/`onClose` are owned by the consumer.
import { h, ref, watch, onMounted, onUnmounted, nextTick, toRef, isRef, computed } from 'vue'
import { POPOVER_FOCUSABLE, POPOVER_ENTER_MS, popoverAnchorStyle, resolvePlacement, popoverMaxHeight } from '../blocks/popover-styles.js'

// The lifecycle composable: owns render/visible/mounted + the reflow-driven enter, the edge-aware
// placement, the outside-pointer and Escape close, and focus (into the panel on open, restored to the
// trigger on close). `open` is a ref to the live boolean; `onClose` fires on outside-click / Escape;
// `requested` is the desired placement (flipped on open if it would overflow). Returns the render flags,
// the refs for the wrapper (rootEl) + panel (panelEl), and the resolved `placement` + `maxHeight` refs.
export function usePopover(open, onClose, requested = 'bottom-start') {
  // `requested` may be a ref (the Popover component passes one so a changed `placement` prop re-measures,
  // matching React's `requested` effect dep) or a plain string (external callers); normalize to a ref.
  const requestedRef = isRef(requested) ? requested : ref(requested)
  const requestedOf = () => requestedRef.value ?? 'bottom-start'
  const render = ref(open.value) // in the DOM (kept during the exit transition)
  const visible = ref(false) // drives the enter/exit CSS
  const mounted = ref(false) // client only — matches SSR (trigger-only) on first paint
  const placement = ref(requestedOf())
  const maxHeight = ref(null)
  const rootEl = ref(null)
  const panelEl = ref(null)
  const lastFocused = ref(null)
  let exitTimer = null

  onMounted(() => (mounted.value = true))

  const onDown = (e) => {
    if (rootEl.value && !rootEl.value.contains(e.target)) onClose()
  }
  const onKey = (e) => {
    if (e.key === 'Escape') onClose()
  }
  const listen = () => {
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
  }
  const unlisten = () => {
    document.removeEventListener('pointerdown', onDown)
    document.removeEventListener('keydown', onKey)
  }

  // Measure the trigger + panel and flip the placement / cap the height if it would overflow the
  // viewport. Split out of `enter` so a `requested` change can re-run it while open (below), matching
  // React's measure effect keyed on `[render, open, requested]`.
  const measure = () => {
    if (!(panelEl.value && rootEl.value)) return
    const trigger = rootEl.value.getBoundingClientRect()
    const panel = panelEl.value.getBoundingClientRect()
    const viewport = { width: window.innerWidth, height: window.innerHeight }
    placement.value = resolvePlacement(requestedOf(), trigger, panel, viewport)
    maxHeight.value = popoverMaxHeight(placement.value, trigger, viewport)
  }

  // Once the panel is in the DOM: measure/flip the placement, paint the hidden "from" frame (a reflow),
  // flip to visible next frame (else mount + visible land in one frame with nothing to animate from), and
  // move focus into the panel. Listening for outside-close rides the render transition below, not here.
  const enter = () =>
    nextTick(() => {
      measure()
      if (panelEl.value) void panelEl.value.getBoundingClientRect()
      requestAnimationFrame(() => (visible.value = true))
      panelEl.value?.querySelector(POPOVER_FOCUSABLE)?.focus?.()
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
      // Start the exit; unlisten + focus-restore ride the `render`-goes-false transition below, so they
      // land AFTER the exit animation (matching React) rather than immediately on close.
      visible.value = false
      exitTimer = setTimeout(() => (render.value = false), POPOVER_ENTER_MS)
    }
  })

  // Attach the outside-close listeners while rendered; remove them and restore focus once `render`
  // clears after the exit. Keyed on the render TRANSITION like React's useEffect([render]).
  watch(render, (isRendered) => {
    if (isRendered) listen()
    else {
      unlisten()
      lastFocused.value?.focus?.()
      lastFocused.value = null
    }
  })

  // Re-measure when the requested placement changes while open (React re-runs its measure effect since
  // `requested` is a dep). A plain-string caller's ref never changes, so this is a no-op for them.
  watch(requestedRef, () => {
    if (render.value && open.value) measure()
  })

  onMounted(() => {
    if (open.value) {
      listen() // initial-open: render starts true, so the render-watch above won't fire for it
      enter()
    }
  })
  onUnmounted(() => {
    if (exitTimer) clearTimeout(exitTimer)
    unlisten()
  })

  return { render, visible, mounted, rootEl, panelEl, placement, maxHeight }
}

// The wrapper + anchored panel. `trigger` is the always-rendered opener slot (the consumer wires its
// own onClick to toggle `open`); `panelStyle(visible, placement)` is the panel's box + enter/exit
// transform (use popoverMotionStyle, plus popoverSurfaceStyle for menu-style content) — it receives the
// RESOLVED placement, which may have flipped. The panel is capped to the available height and scrolls if
// taller. Renders the panel only once mounted + in the render window, so SSR emits just the trigger.
export const Popover = {
  props: ['open', 'onClose', 'trigger', 'placement', 'role', 'labelledBy', 'panelStyle'],
  setup(props, { slots }) {
    const openRef = toRef(props, 'open')
    const close = () => props.onClose?.()
    // A reactive `requested` (not a snapshot) so a changed `placement` prop re-measures, like React.
    const requested = computed(() => props.placement ?? 'bottom-start')
    const { render, visible, mounted, rootEl, panelEl, placement, maxHeight } = usePopover(openRef, close, requested)
    return () => {
      const children = [props.trigger ?? slots.trigger?.()]
      if (mounted.value && render.value) {
        children.push(
          h(
            'div',
            {
              ref: panelEl,
              role: props.role ?? 'dialog',
              'aria-labelledby': props.labelledBy,
              style: {
                ...popoverAnchorStyle(placement.value),
                ...(maxHeight.value != null ? { maxHeight: `${maxHeight.value}px`, overflowY: 'auto' } : {}),
                ...props.panelStyle(visible.value, placement.value),
              },
            },
            slots.default?.(),
          ),
        )
      }
      return h('div', { ref: rootEl, style: { position: 'relative', display: 'inline-block' } }, children)
    }
  },
}
