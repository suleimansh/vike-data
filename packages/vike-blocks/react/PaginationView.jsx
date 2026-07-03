// The React renderer for the `pagination` block — a dep-free, theme-native page navigation harvested
// from shadcn's Pagination (nav > ul > li > a). The page / prev / next links reuse the button block's
// styles (active page = outline + aria-current, others = ghost), so pagination can't drift from the rest
// of the catalog. Each page is a real <a href>, so paging works with no client JS (native navigation) —
// there's no local state, and SSR renders the final links (no hydration concern). `hrefTemplate`
// substitutes `{page}`; a hand-rendered app can pass an `href(page)` function instead.
import { registerBlockRenderer } from './registry.js'
import { buttonStyle, BUTTON_STYLE_TAG } from '../button-styles.js'
import { paginationRange, paginationNavStyle, paginationListStyle, paginationItemStyle, paginationEllipsisStyle, CHEVRON_LEFT_PATH, CHEVRON_RIGHT_PATH } from '../pagination-styles.js'

const Chevron = ({ d }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

export function PaginationView({ page = 1, pageCount = 1, siblings = 1, prevLabel = 'Previous', nextLabel = 'Next', hrefTemplate = null, href = null }) {
  const total = Math.max(0, Math.floor(pageCount) || 0)
  if (total <= 1) return null // nothing to page
  const cur = Math.min(Math.max(1, page), total)
  const hrefFor = typeof href === 'function' ? href : hrefTemplate ? (p) => hrefTemplate.replaceAll('{page}', String(p)) : () => undefined
  const pages = paginationRange(cur, total, siblings)

  const edgeStyle = (disabled) => ({ ...buttonStyle('ghost', 'default'), gap: '0.35rem', ...(disabled ? { opacity: 0.5, cursor: 'default', color: 'var(--color-muted, #64748b)' } : {}) })
  const linkStyle = (active) => buttonStyle(active ? 'outline' : 'ghost', 'icon')

  return (
    <nav role="navigation" aria-label="pagination" data-slot="pagination" style={paginationNavStyle()}>
      <style>{BUTTON_STYLE_TAG}</style>
      <ul data-slot="pagination-content" style={paginationListStyle()}>
        <li style={paginationItemStyle()}>
          {cur <= 1 ? (
            <span aria-disabled="true" style={edgeStyle(true)}>
              <Chevron d={CHEVRON_LEFT_PATH} />
              {prevLabel}
            </span>
          ) : (
            <a href={hrefFor(cur - 1)} className="vike-blocks-btn" aria-label="Go to previous page" style={edgeStyle(false)}>
              <Chevron d={CHEVRON_LEFT_PATH} />
              {prevLabel}
            </a>
          )}
        </li>
        {pages.map((p, i) => (
          <li key={i} style={paginationItemStyle()}>
            {p === 'ellipsis' ? (
              <span aria-hidden="true" data-slot="pagination-ellipsis" style={paginationEllipsisStyle()}>
                {'…'}
              </span>
            ) : (
              <a href={hrefFor(p)} className="vike-blocks-btn" data-slot="pagination-link" aria-current={p === cur ? 'page' : undefined} data-active={p === cur ? 'true' : undefined} style={linkStyle(p === cur)}>
                {p}
              </a>
            )}
          </li>
        ))}
        <li style={paginationItemStyle()}>
          {cur >= total ? (
            <span aria-disabled="true" style={edgeStyle(true)}>
              {nextLabel}
              <Chevron d={CHEVRON_RIGHT_PATH} />
            </span>
          ) : (
            <a href={hrefFor(cur + 1)} className="vike-blocks-btn" aria-label="Go to next page" style={edgeStyle(false)}>
              {nextLabel}
              <Chevron d={CHEVRON_RIGHT_PATH} />
            </a>
          )}
        </li>
      </ul>
    </nav>
  )
}

registerBlockRenderer('pagination', PaginationView)
