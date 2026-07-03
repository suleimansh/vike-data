// Shared, framework-agnostic styling + the page-range algorithm for the `pagination` block, imported by
// BOTH the react and vue renderers so the twins can't drift. The page/prev/next LINK styles reuse the
// button block's buttonStyle in the renderer (active = outline, others = ghost); this owns the nav/list
// layout, the ellipsis, and the disabled-edge look, plus the pure `paginationRange` helper.

import { clamp } from './_shared.js'

// The lucide chevron paths for the Prev / Next controls, stroked in currentColor.
export const CHEVRON_LEFT_PATH = 'm15 18-6-6 6-6'
export const CHEVRON_RIGHT_PATH = 'm9 18 6-6-6-6'

// Which page numbers to show for `page` of `pageCount`, with `siblings` on each side of the current
// page and the first + last always shown; gaps collapse to an 'ellipsis' marker. Returns an array of
// page numbers and 'ellipsis' strings. Pure + agnostic, so it is unit-tested and shared by both twins.
//
//   paginationRange(6, 10, 1) -> [1, 'ellipsis', 5, 6, 7, 'ellipsis', 10]
//   paginationRange(1, 5, 1)  -> [1, 2, 'ellipsis', 5]
export function paginationRange(page, pageCount, siblings = 1) {
  const total = Math.max(0, Math.floor(pageCount) || 0)
  if (total <= 1) return total === 1 ? [1] : []
  const cur = clamp(Math.floor(page) || 1, 1, total)
  const s = Math.max(0, Math.floor(siblings) || 0)
  const left = Math.max(2, cur - s)
  const right = Math.min(total - 1, cur + s)
  const items = [1]
  if (left > 2) items.push('ellipsis') // a gap between the first page and the window
  for (let p = left; p <= right; p++) items.push(p)
  if (right < total - 1) items.push('ellipsis') // a gap between the window and the last page
  items.push(total)
  return items
}

// The <nav> wrapper (centered) and the <ul> row.
export const paginationNavStyle = () => ({ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' })
export const paginationListStyle = () => ({ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.25rem', listStyle: 'none', margin: 0, padding: 0 })
export const paginationItemStyle = () => ({ display: 'flex' })

// The ellipsis cell — a square, muted gap marker (three dots).
export const paginationEllipsisStyle = () => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.25rem',
  height: '2.25rem',
  color: 'var(--color-muted, #64748b)',
})
