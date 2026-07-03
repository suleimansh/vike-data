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
  toastCardStyle,
  toastIconStyle,
  toastTitleStyle,
  toastDescStyle,
  toastCloseStyle,
  TOAST_VISIBLE,
  TOAST_GAP,
  TOAST_STYLE_TAG,
} from '../blocks/toast-styles.js'

const ToastRow = {
  props: ['toast', 'side', 'index', 'total', 'expanded', 'heightsInFront', 'hidden', 'onMeasure'],
  setup(props) {
    const entered = ref(false)
    const el = ref(null)
    const measure = () => {
      if (el.value) props.onMeasure(props.toast.id, el.value.offsetHeight)
    }
    onMounted(() => {
      measure()
      requestAnimationFrame(() => (entered.value = true)) // flip to visible next frame -> enter animates
    })
    onUpdated(measure) // keep the reported height current as content/state changes
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
          style: { ...toastCardStyle(t.intent), ...toastStackStyle({ index: props.index, total: props.total, side: props.side, expanded: props.expanded, heightsInFront: props.heightsInFront, hidden: props.hidden, show }) },
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
    const heights = ref({})
    const onMeasure = (id, hgt) => {
      if (heights.value[id] !== hgt) heights.value = { ...heights.value, [id]: hgt }
    }
    return () => {
      const side = props.position.split('-')[0]
      const ordered = [...props.toasts].reverse() // newest first = the front of the deck
      const hOf = (t) => heights.value[t.id] ?? 64
      const inFront = []
      let acc = 0
      for (const t of ordered) {
        inFront.push(acc)
        acc += hOf(t) + TOAST_GAP
      }
      const extent = toastDeckExtent(ordered.map(hOf), expanded.value)
      return h(
        'div',
        {
          'data-slot': 'toaster',
          style: toastRegionStyle(props.position, extent),
          onMouseenter: () => (expanded.value = true),
          onMouseleave: () => (expanded.value = false),
          onFocusin: () => (expanded.value = true),
          onFocusout: (e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) expanded.value = false
          },
        },
        ordered.map((t, i) =>
          h(ToastRow, { key: t.id, toast: t, side, index: i, total: ordered.length, expanded: expanded.value, heightsInFront: inFront[i], hidden: !expanded.value && i >= TOAST_VISIBLE, onMeasure }),
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
