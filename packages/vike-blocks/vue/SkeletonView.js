// The Vue renderer for the `skeleton` block — the Vue twin of react/SkeletonView.jsx, a dep-free,
// theme-native pulsing placeholder. The pulse is pure CSS (the shared SKELETON_STYLE_TAG), so there's no
// JS and no state, and SSR renders the final markup. One bar by default; `lines > 1` renders a stack of
// text bars with the last one shorter. Shares the styles with the React renderer via skeleton-styles.
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { skeletonBarStyle, skeletonStackStyle, SKELETON_STYLE_TAG } from '../skeleton-styles.js'

const FALLBACK_RADIUS = 'var(--radius, 6px)'

export const SkeletonView = {
  props: ['width', 'height', 'radius', 'lines'],
  setup(props) {
    return () => {
      const width = props.width ?? '100%'
      const height = props.height ?? '1rem'
      const r = props.radius ?? FALLBACK_RADIUS
      const lines = props.lines ?? 1
      if (lines > 1) {
        const bars = Array.from({ length: lines }, (_, i) =>
          h('div', { key: i, class: 'vike-blocks-skeleton', 'data-slot': 'skeleton', style: skeletonBarStyle(i === lines - 1 ? '60%' : width, height, r) }),
        )
        return h('div', { style: skeletonStackStyle() }, [h('style', SKELETON_STYLE_TAG), ...bars])
      }
      return [h('style', SKELETON_STYLE_TAG), h('div', { class: 'vike-blocks-skeleton', 'data-slot': 'skeleton', style: skeletonBarStyle(width, height, r) })]
    }
  },
}

registerBlockRenderer('skeleton', SkeletonView)
