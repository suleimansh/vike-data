// The shared popover primitive for Vue — the Vue twin of react/popover.jsx, the light sibling of the
// overlay primitive (vue/overlay.js). Where the overlay is a modal (backdrop + scroll-lock + focus
// trap, Teleport to <body>), a popover is a non-modal surface anchored to its trigger: no backdrop, no
// scroll-lock, no focus trap — it just closes on an outside pointer-down or Escape. Written ONCE so the
// anchored surfaces reuse it (date-picker first, then the dropdown/nav menus). The panel is a
// `position:absolute` child of a `position:relative` wrapper around the trigger, so it follows the
// trigger with no portal and no coordinate math (dep-free). SSR renders only the trigger (the panel is
// client + open-gated), so there's no hydration mismatch. `open`/`onClose` are owned by the consumer.
import { h, ref, watch, onMounted, onUnmounted, nextTick, toRef } from 'vue'
import { POPOVER_FOCUSABLE, POPOVER_ENTER_MS, popoverAnchorStyle } from '../popover-styles.js'

// The lifecycle composable: owns render/visible/mounted + the reflow-driven enter, the outside-pointer
// and Escape close, and focus (into the panel on open, restored to the trigger on close). `open` is a
// ref to the live boolean; `onClose` fires on outside-click / Escape. Returns the flags the panel
// renders from plus the refs to attach to the wrapper (rootEl) and the panel (panelEl).
export function usePopover(open, onClose) {
  const render = ref(open.value) // in the DOM (kept during the exit transition)
  const visible = ref(false) // drives the enter/exit CSS
  const mounted = ref(false) // client only — matches SSR (trigger-only) on first paint
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
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
  }
  const unlisten = () => {
    document.removeEventListener('mousedown', onDown)
    document.removeEventListener('keydown', onKey)
  }

  // Once the panel is in the DOM: listen for outside-close, paint the hidden "from" frame (a reflow),
  // flip to visible next frame (else mount + visible land in one frame with nothing to animate from),
  // and move focus into the panel.
  const enter = () =>
    nextTick(() => {
      listen()
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
      visible.value = false
      unlisten()
      lastFocused.value?.focus?.()
      lastFocused.value = null
      exitTimer = setTimeout(() => (render.value = false), POPOVER_ENTER_MS)
    }
  })

  onMounted(() => {
    if (open.value) enter()
  })
  onUnmounted(() => {
    if (exitTimer) clearTimeout(exitTimer)
    unlisten()
  })

  return { render, visible, mounted, rootEl, panelEl }
}

// The wrapper + anchored panel. `trigger` is the always-rendered opener slot (the consumer wires its
// own onClick to toggle `open`); `panelStyle(visible)` is the panel's box + enter/exit transform (use
// popoverMotionStyle, plus popoverSurfaceStyle for menu-style content). Renders the panel only once
// mounted + in the render window, so SSR emits just the trigger.
export const Popover = {
  props: ['open', 'onClose', 'trigger', 'placement', 'role', 'labelledBy', 'panelStyle'],
  setup(props, { slots }) {
    const openRef = toRef(props, 'open')
    const close = () => props.onClose?.()
    const { render, visible, mounted, rootEl, panelEl } = usePopover(openRef, close)
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
              style: { ...popoverAnchorStyle(props.placement ?? 'bottom-start'), ...props.panelStyle(visible.value) },
            },
            slots.default?.(),
          ),
        )
      }
      return h('div', { ref: rootEl, style: { position: 'relative', display: 'inline-block' } }, children)
    }
  },
}
