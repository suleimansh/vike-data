// The React renderer for the `skeleton` block — a dep-free, theme-native pulsing placeholder. The pulse
// is pure CSS (the shared SKELETON_STYLE_TAG), so there's no JS and no state, and SSR renders the final
// markup. One bar by default; `lines > 1` renders a stack of text bars with the last one shorter.
// Styles come from the shared skeleton-styles module, so this can't drift from the Vue twin.
import { registerBlockRenderer } from './registry.js'
import { skeletonBarStyle, skeletonStackStyle, SKELETON_STYLE_TAG } from '../skeleton-styles.js'

const FALLBACK_RADIUS = 'var(--radius, 6px)'

export function SkeletonView({ width = '100%', height = '1rem', radius = null, lines = 1 }) {
  const r = radius ?? FALLBACK_RADIUS
  if (lines > 1) {
    return (
      <div style={skeletonStackStyle()}>
        <style>{SKELETON_STYLE_TAG}</style>
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="vike-blocks-skeleton" data-slot="skeleton" style={skeletonBarStyle(i === lines - 1 ? '60%' : width, height, r)} />
        ))}
      </div>
    )
  }
  return (
    <>
      <style>{SKELETON_STYLE_TAG}</style>
      <div className="vike-blocks-skeleton" data-slot="skeleton" style={skeletonBarStyle(width, height, r)} />
    </>
  )
}

registerBlockRenderer('skeleton', SkeletonView)
