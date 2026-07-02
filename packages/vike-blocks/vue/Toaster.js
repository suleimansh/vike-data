// The Vue Toaster region — the Vue twin of react/Toaster.jsx, the rendered half of the imperative
// `toast` block. Mount it once (in your root layout); it subscribes to the agnostic toast store and
// renders each live toast in a fixed corner stack, grouped by the toast's position (or this Toaster's
// default). Each row plays an enter animation on mount (hidden frame -> reflow -> visible) and an exit
// when the store flags the toast `dismissed`, then the store hard-removes it. Teleported to <body> and
// gated on mount, so SSR emits nothing. Shares the stacking / card / intent styles via toast-styles.
import { h, ref, onMounted, onUnmounted, Teleport } from 'vue'
import { subscribeToasts, dismissToast } from '../toast-store.js'
import { resolveToastIntent, toastRegionStyle, toastCardStyle, toastIconStyle, toastTitleStyle, toastDescStyle, toastCloseStyle, TOAST_STYLE_TAG } from '../toast-styles.js'

const ToastRow = {
  props: ['toast', 'position'],
  setup(props) {
    const entered = ref(false)
    const el = ref(null)
    onMounted(() => {
      if (el.value) void el.value.getBoundingClientRect() // paint the hidden "from" frame before flipping
      requestAnimationFrame(() => (entered.value = true))
    })
    return () => {
      const t = props.toast
      const show = entered.value && !t.dismissed
      const { icon } = resolveToastIntent(t.intent)
      return h('div', { ref: el, role: 'status', 'aria-live': 'polite', style: toastCardStyle(t.intent, { show, position: props.position }) }, [
        icon != null ? h('span', { 'aria-hidden': 'true', style: toastIconStyle(t.intent) }, icon) : null,
        h('div', { style: { minWidth: 0 } }, [h('div', { style: toastTitleStyle() }, t.message), t.description != null ? h('div', { style: toastDescStyle() }, t.description) : null]),
        h('button', { type: 'button', class: 'vike-blocks-toast-close', 'aria-label': 'Dismiss', style: toastCloseStyle(), onClick: () => dismissToast(t.id) }, '×'),
      ])
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
      const regions = Object.entries(groups).map(([pos, list]) =>
        h('div', { key: pos, 'data-slot': 'toaster', style: toastRegionStyle(pos) }, list.map((t) => h(ToastRow, { key: t.id, toast: t, position: pos }))),
      )
      return h(Teleport, { to: 'body' }, [h('style', TOAST_STYLE_TAG), ...regions])
    }
  },
}
