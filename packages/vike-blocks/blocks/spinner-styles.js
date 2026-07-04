// Shared, framework-agnostic style data for the `spinner` block, imported by BOTH the react and vue
// renderers so the surface can't drift. A from-scratch, dep-free loading spinner: a ring with one
// tinted track and a solid arc that rotates (pure-CSS `@keyframes`, no JS/state, SSR-perfect). The
// arc reads a theme color and the spin slows (not stops) under `prefers-reduced-motion`.

// A CSS length: a bare number becomes px; a string (e.g. '1.5rem') passes through.
export const cssLen = (v) => (typeof v === 'number' ? `${v}px` : v)

// The spinner tones -> the arc color (the track is a muted tint of it). Default reads the primary.
export const SPINNER_TONES = {
  default: 'var(--color-primary, #2563eb)',
  muted: 'var(--color-muted, #64748b)',
  success: 'var(--color-success, #16a34a)',
  warning: 'var(--color-warning, #d97706)',
  danger: 'var(--color-danger, #dc2626)',
}
export const spinnerColor = (tone) => SPINNER_TONES[tone] ?? SPINNER_TONES.default

// The rotating ring's box: a `size` circle with a `thickness` border, the track a tint of the arc
// color and the top side the solid arc that spins.
export function spinnerRingStyle(size, thickness, tone) {
  const color = spinnerColor(tone)
  return {
    display: 'inline-block',
    width: cssLen(size),
    height: cssLen(size),
    border: `${thickness}px solid color-mix(in srgb, ${color} 22%, transparent)`,
    borderTopColor: color,
    borderRadius: '50%',
    boxSizing: 'border-box',
    flexShrink: 0,
  }
}

// The inline row when a label sits beside the ring.
export const spinnerRowStyle = () => ({ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' })
export const spinnerLabelStyle = () => ({ color: 'var(--color-muted, #64748b)', fontSize: '14px' })

// Static <style>: the spin keyframes on the `vike-blocks-spinner` class; slowed under reduced motion
// (a stopped spinner would read as frozen/broken, so it eases rather than halts).
export const SPINNER_STYLE_TAG =
  '@keyframes vike-blocks-spin{to{transform:rotate(360deg)}}' +
  '.vike-blocks-spinner{animation:vike-blocks-spin .7s linear infinite}' +
  '@media (prefers-reduced-motion: reduce){.vike-blocks-spinner{animation-duration:2.4s}}'
