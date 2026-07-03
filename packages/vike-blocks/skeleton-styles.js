// Shared, framework-agnostic style data for the `skeleton` block, imported by BOTH the react and vue
// renderers so the surface can't drift. Dep-free reimplementation of shadcn's skeleton: a pulsing
// placeholder box. The pulse is a pure-CSS `@keyframes` on the `vike-blocks-skeleton` class in a static
// style tag (no JS, no state, SSR-perfect); the tint is a theme-native muted color-mix that reads on any
// background, and it respects `prefers-reduced-motion`.

// A CSS length: a bare number becomes px; a string (e.g. '100%', '1rem') passes through.
export const cssLen = (v) => (typeof v === 'number' ? `${v}px` : v)
// A corner radius: 'full' -> a pill/circle, a number -> px, else pass through.
export const cssRadius = (v) => (v === 'full' ? '999px' : typeof v === 'number' ? `${v}px` : v)

// One placeholder bar's box.
export function skeletonBarStyle(width, height, radius) {
  return { width: cssLen(width), height: cssLen(height), borderRadius: cssRadius(radius), flexShrink: 0 }
}

// The vertical stack used for a multi-line text skeleton.
export const skeletonStackStyle = () => ({ display: 'flex', flexDirection: 'column', gap: '0.55rem' })

// The static <style>: the pulse keyframes + the tinted surface, motion off under reduced-motion.
export const SKELETON_STYLE_TAG =
  '@keyframes vike-blocks-pulse{0%,100%{opacity:1}50%{opacity:.5}}' +
  '.vike-blocks-skeleton{background:color-mix(in srgb,var(--color-muted,#94a3b8) 22%,transparent);animation:vike-blocks-pulse 1.6s ease-in-out infinite}' +
  '@media (prefers-reduced-motion: reduce){.vike-blocks-skeleton{animation:none}}'
