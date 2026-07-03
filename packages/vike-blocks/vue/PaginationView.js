// The Vue renderer for the `pagination` block — the Vue twin of react/PaginationView.jsx, a dep-free,
// theme-native page navigation harvested from shadcn's Pagination. The page / prev / next links reuse
// the button block's styles (active = outline + aria-current, others = ghost). Each page is a real
// <a href>, so paging works with no client JS; there's no local state. `hrefTemplate` substitutes
// `{page}`; a hand-rendered app can pass an `href(page)` function instead. Shares the range + layout
// with the React renderer via pagination-styles.
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { BUTTON_STYLE_TAG } from '../blocks/button-styles.js'
import { paginationRange, paginationNavStyle, paginationListStyle, paginationItemStyle, paginationEllipsisStyle, paginationEdgeStyle as edgeStyle, paginationLinkStyle as linkStyle, CHEVRON_LEFT_PATH, CHEVRON_RIGHT_PATH } from '../blocks/pagination-styles.js'

const chevron = (d) =>
  h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d })])

export const PaginationView = {
  props: ['page', 'pageCount', 'siblings', 'prevLabel', 'nextLabel', 'hrefTemplate', 'href'],
  setup(props) {
    return () => {
      const total = Math.max(0, Math.floor(props.pageCount) || 0)
      if (total <= 1) return null
      const cur = Math.min(Math.max(1, props.page ?? 1), total)
      const siblings = props.siblings ?? 1
      const prevLabel = props.prevLabel ?? 'Previous'
      const nextLabel = props.nextLabel ?? 'Next'
      const hrefFor = typeof props.href === 'function' ? props.href : props.hrefTemplate ? (p) => props.hrefTemplate.replaceAll('{page}', String(p)) : () => undefined
      const pages = paginationRange(cur, total, siblings)

      const prevCell =
        cur <= 1
          ? h('span', { 'aria-disabled': 'true', style: edgeStyle(true) }, [chevron(CHEVRON_LEFT_PATH), prevLabel])
          : h('a', { href: hrefFor(cur - 1), class: 'vike-blocks-btn', 'aria-label': 'Go to previous page', style: edgeStyle(false) }, [chevron(CHEVRON_LEFT_PATH), prevLabel])

      const nextCell =
        cur >= total
          ? h('span', { 'aria-disabled': 'true', style: edgeStyle(true) }, [nextLabel, chevron(CHEVRON_RIGHT_PATH)])
          : h('a', { href: hrefFor(cur + 1), class: 'vike-blocks-btn', 'aria-label': 'Go to next page', style: edgeStyle(false) }, [nextLabel, chevron(CHEVRON_RIGHT_PATH)])

      const pageCells = pages.map((p, i) =>
        h(
          'li',
          { key: i, style: paginationItemStyle() },
          p === 'ellipsis'
            ? h('span', { 'aria-hidden': 'true', 'data-slot': 'pagination-ellipsis', style: paginationEllipsisStyle() }, '…')
            : h('a', { href: hrefFor(p), class: 'vike-blocks-btn', 'data-slot': 'pagination-link', 'aria-current': p === cur ? 'page' : undefined, 'data-active': p === cur ? 'true' : undefined, style: linkStyle(p === cur) }, String(p)),
        ),
      )

      return h('nav', { role: 'navigation', 'aria-label': 'pagination', 'data-slot': 'pagination', style: paginationNavStyle() }, [
        h('style', BUTTON_STYLE_TAG),
        h('ul', { 'data-slot': 'pagination-content', style: paginationListStyle() }, [h('li', { style: paginationItemStyle() }, prevCell), ...pageCells, h('li', { style: paginationItemStyle() }, nextCell)]),
      ])
    }
  },
}

registerBlockRenderer('pagination', PaginationView)
