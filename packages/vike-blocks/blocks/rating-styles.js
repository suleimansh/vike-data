// Shared, framework-agnostic logic + styling for the `rating` block, imported by BOTH renderers so the
// twins can't drift. Owns the two pure pieces the renderers share — turning a pointer x into a rating,
// and a rating into a per-star fill fraction — plus the star geometry and theme-native styles.

// The star outline path (a 5-point star in a 24x24 box), shared by the empty + filled star layers.
export const STAR_PATH = 'M12 2.5l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.4l-5.8 3.05 1.1-6.45-4.7-4.6 6.5-.95z'

// The smallest selectable rating: a half when half-steps are on, else a whole star. (Zero is only set
// by the initial value / clearing, never by a forward pointer/keyboard move.)
const minStep = (allowHalf) => (allowHalf ? 0.5 : 1)

// Snap an arbitrary rating to the grid (whole or half stars) and clamp to [0, max].
export function snapRating(value, max, allowHalf) {
  const unit = allowHalf ? 2 : 1
  const snapped = Math.round((Number(value) || 0) * unit) / unit
  return Math.min(Math.max(0, snapped), max)
}

// Turn a pointer x (relative to the star row's bounding rect) into a rating. Divides the row into `max`
// stars; when half-steps are on, the left half of a star is x.5 and the right half is x+1. Rounds UP to
// the star/half the pointer is within, so the whole star under the cursor reads as selected. Returns a
// value in [minStep, max]; null when the row has no width yet (nothing to measure).
export function ratingValueAt(clientX, rect, max, allowHalf) {
  if (!rect || rect.width === 0) return null
  const ratio = Math.min(Math.max(0, (clientX - rect.left) / rect.width), 1)
  const raw = ratio * max
  const unit = allowHalf ? 2 : 1
  const value = Math.ceil(raw * unit) / unit
  return Math.min(Math.max(minStep(allowHalf), value), max)
}

// How full the star at `index` (0-based) is for a given rating: 1 = full, 0.5 = half, 0 = empty.
export function starFill(index, value) {
  return Math.min(Math.max(value - index, 0), 1)
}

export const ratingRootStyle = (disabled) => ({
  display: 'inline-flex',
  flexDirection: 'column',
  gap: '0.3rem',
  font: 'inherit',
  opacity: disabled ? 0.5 : 1,
})

export const ratingLabelStyle = () => ({ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '14px', color: 'var(--color-text, #0f172a)' })

export const ratingValueReadout = () => ({ color: 'var(--color-muted, #64748b)', fontVariantNumeric: 'tabular-nums' })

// The star row. Interactive ratings get a pointer cursor; read-only/disabled do not.
export function ratingRowStyle(interactive) {
  return {
    display: 'inline-flex',
    gap: '0.15rem',
    cursor: interactive ? 'pointer' : 'default',
    outline: 'none',
    width: 'fit-content',
  }
}

// One star cell: an empty (outline) star with a colored fill layer clipped to `fill` of its width, so a
// half rating shows a half-filled star. `size` is the star box in px.
export function starCellStyle(size) {
  return { position: 'relative', display: 'inline-block', width: `${size}px`, height: `${size}px`, flexShrink: 0 }
}

export function starFillClipStyle(fill) {
  return { position: 'absolute', inset: 0, width: `${fill * 100}%`, overflow: 'hidden', transition: 'width 0.12s ease' }
}

export const STAR_EMPTY_COLOR = 'var(--color-border, #d4d4d8)'
export const STAR_FILL_COLOR = 'var(--color-warning, #f59e0b)'

// Static <style>: the focus ring on the interactive row + stilling the fill transition under
// reduced-motion. Class-only selectors (Vue escapes quoted attribute selectors inside <style>).
export const RATING_STYLE_TAG =
  '.vike-blocks-rating:focus-visible{outline:2px solid var(--color-primary,#6366f1);outline-offset:3px;border-radius:4px}' +
  '@media (prefers-reduced-motion: reduce){.vike-blocks-rating-fill{transition:none}}'
