// Shared, framework-agnostic style data + helper for the `progress` block, imported by BOTH the react
// and vue renderers so the surface can't drift. Dep-free reimplementation of shadcn's Radix progress: a
// rounded track with a primary fill sized to the value (a pure-CSS width transition), plus an
// indeterminate mode (a segment sliding across via keyframes). Theme-native via `var(--color-primary)`.

import { clamp } from './_shared.js'

// Clamp a value/max to a 0-100 percentage. Pure + agnostic, so it is unit-tested and shared by the twins.
export function clampPercent(value, max = 100) {
  const m = Number(max)
  const v = Number(value) || 0
  if (!Number.isFinite(m) || m <= 0) return 0 // a non-positive / invalid max reads as empty
  return clamp((v / m) * 100, 0, 100)
}

// The optional caption row above the bar (label left, value% right).
export const progressLabelRowStyle = () => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem', fontSize: '13px' })
export const progressLabelStyle = () => ({ color: 'var(--color-text, #0f172a)' })
export const progressValueStyle = () => ({ color: 'var(--color-muted, #64748b)', fontVariantNumeric: 'tabular-nums' })

// The track (a tinted rail) and the determinate fill (width = percent).
export function progressTrackStyle(size = 8) {
  return { position: 'relative', width: '100%', height: `${size}px`, borderRadius: '999px', overflow: 'hidden', background: 'color-mix(in srgb, var(--color-primary, #2563eb) 18%, transparent)' }
}
export function progressFillStyle(percent) {
  return { height: '100%', width: `${percent}%`, borderRadius: 'inherit', background: 'var(--color-primary, #2563eb)', transition: 'width .3s ease' }
}

// Static <style>: the indeterminate segment's slide keyframes (slowed under reduced motion).
export const PROGRESS_STYLE_TAG =
  '@keyframes vike-blocks-progress-indet{0%{left:-40%;width:40%}50%{width:55%}100%{left:100%;width:40%}}' +
  '.vike-blocks-progress-indet{position:absolute;top:0;bottom:0;border-radius:inherit;background:var(--color-primary,#2563eb);animation:vike-blocks-progress-indet 1.2s ease-in-out infinite}' +
  '@media (prefers-reduced-motion: reduce){.vike-blocks-progress-indet{animation-duration:2.4s}}'
