// The Vue Toaster region — the Vue twin of react/Toaster.jsx, a Sonner-style deck. Mount it once (in
// your root layout); it subscribes to the agnostic toast store and renders each live toast in a fixed
// corner, stacked on top of each other. Collapsed (default) the toasts behind the front peek out
// scaled + offset; on hover the deck expands into a readable list. Each row measures its own height (so
// the expanded spread is exact) and plays an enter animation on mount / an exit when the store flags it
// `dismissed`. Teleported to <body> and gated on mount, so SSR emits nothing. Shares the deck math +
// card styles with the React renderer via toast-styles.
import { h, ref, onMounted, onUpdated, onUnmounted, Teleport } from 'vue'
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

const ToastRow = {
  props: ['toast', 'side', 'index', 'total', 'expanded', 'heightsInFront', 'hidden', 'onMeasure', 'onDragChange'],
  setup(props) {
    const entered = ref(false)
    const drag = ref(0) // px swiped toward the edge; 0 = not dragging
    let start = null
    const el = ref(null)
    const measure = () => {
      if (el.value) props.onMeasure(props.toast.id, el.value.offsetHeight)
    }
    onMounted(() => {
      measure()
      requestAnimationFrame(() => (entered.value = true)) // flip to visible next frame -> enter animates
    })
    onUpdated(measure) // keep the reported height current as content/state changes
    // Swipe to dismiss: track the pointer, follow the finger toward the edge, flick closed past the
    // threshold (else snap back). Skip the close button so its click still lands.
    const onPointerdown = (e) => {
      if (e.button !== 0 || e.target.closest('button')) return
      start = { x: e.clientX, y: e.clientY }
      e.currentTarget.setPointerCapture?.(e.pointerId)
      props.onDragChange(true)
    }
    const onPointermove = (e) => {
      if (start) drag.value = toastSwipeOffset(props.side, e.clientY - start.y)
    }
    const onPointerup = (e) => {
      if (!start) return
      const offset = toastSwipeOffset(props.side, e.clientY - start.y)
      start = null
      e.currentTarget.releasePointerCapture?.(e.pointerId)
      drag.value = 0
      props.onDragChange(false)
      if (toastShouldDismiss(offset)) dismissToast(props.toast.id)
    }
    return () => {
      const t = props.toast
      const show = entered.value && !t.dismissed
      const { icon } = resolveToastIntent(t.intent)
      return h(
        'div',
        {
          ref: el,
          role: 'status',
          'aria-live': 'polite',
          style: { ...toastCardStyle(t.intent), ...toastStackStyle({ index: props.index, total: props.total, side: props.side, expanded: props.expanded, heightsInFront: props.heightsInFront, hidden: props.hidden, show, drag: drag.value }) },
          onPointerdown,
          onPointermove,
          onPointerup,
          onPointercancel: onPointerup,
        },
        [
          icon != null ? h('span', { 'aria-hidden': 'true', style: toastIconStyle(t.intent) }, icon) : null,
          h('div', { style: { minWidth: 0 } }, [h('div', { style: toastTitleStyle() }, t.message), t.description != null ? h('div', { style: toastDescStyle() }, t.description) : null]),
          h('button', { type: 'button', class: 'vike-blocks-toast-close', 'aria-label': 'Dismiss', style: toastCloseStyle(), onClick: () => dismissToast(t.id) }, '×'),
        ],
      )
    }
  },
}

const ToastRegion = {
  props: ['position', 'toasts'],
  setup(props) {
    const expanded = ref(false)
    const dragging = ref(false) // a row is mid-swipe: don't let the deck collapse under it
    const heights = ref({})
    const onMeasure = (id, hgt) => {
      if (heights.value[id] !== hgt) heights.value = { ...heights.value, [id]: hgt }
    }
    return () => {
      const side = props.position.split('-')[0]
      const ordered = [...props.toasts].reverse() // newest first = the front of the deck
      const hOf = (t) => heights.value[t.id] ?? 64
      const inFront = toastDeckOffsets(ordered, hOf, TOAST_GAP) // height (+gap) in front of each toast
      const extent = toastDeckExtent(ordered.map(hOf), expanded.value)
      return h(
        'div',
        {
          'data-slot': 'toaster',
          style: toastRegionStyle(props.position, extent),
          onMouseenter: () => (expanded.value = true),
          onMouseleave: () => {
            if (!dragging.value) expanded.value = false
          },
          onFocusin: () => (expanded.value = true),
          onFocusout: (e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) expanded.value = false
          },
        },
        ordered.map((t, i) =>
          h(ToastRow, { key: t.id, toast: t, side, index: i, total: ordered.length, expanded: expanded.value, heightsInFront: inFront[i], hidden: !expanded.value && i >= TOAST_VISIBLE, onMeasure, onDragChange: (v) => (dragging.value = v) }),
        ),
      )
    }
  },
}

export const Toaster = {
  props: ['position'],
  setup(props) {
    const items = ref([])
    const mounted = ref(false)
    let unsub = null
    onMounted(() => {
      mounted.value = true
      unsub = subscribeToasts((snapshot) => (items.value = snapshot))
    })
    onUnmounted(() => unsub?.())
    return () => {
      if (!mounted.value) return null
      const groups = {}
      for (const t of items.value) {
        const pos = t.position ?? props.position ?? 'bottom-right'
        ;(groups[pos] ??= []).push(t)
      }
      const regions = Object.entries(groups).map(([pos, list]) => h(ToastRegion, { key: pos, position: pos, toasts: list }))
      return h(Teleport, { to: 'body' }, [h('style', TOAST_STYLE_TAG), ...regions])
    }
  },
}
