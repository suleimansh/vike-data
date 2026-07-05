// The `pagination` block — page navigation for a list/table, harvested from shadcn's Pagination
// (nav > ul > li > a: ghost page links, the active page `outline` + aria-current, chevron Prev/Next, an
// ellipsis for gaps). shadcn leaves the page-range math to the consumer; this block OWNS it
// (paginationRange in pagination-styles) so you only pass the current page + total. Each page is a real
// <a href> built from a URL template, so paging works with no client JS (native navigation).
//
//   pagination(3, 10)                       // page 3 of 10
//     .href('/posts?page={page}')           // {page} is substituted per link
//     .siblings(1)                          // page numbers shown on each side of the current
//
// The mutation-free navigation is plain links; there's no local state. For a hand-rendered app that
// builds URLs itself, the PaginationView renderer also accepts an `href` function directly.
import { registerBlock } from '../core/registry.js'

// A fluent builder for a pagination block. `page` is the current 1-based page; `pageCount` the total.
export function pagination(page, pageCount) {
  let hrefTemplate
  let siblings = 1
  let prevLabel = 'Previous'
  let nextLabel = 'Next'
  const self = {
    // A URL template containing `{page}`, substituted for each page link (e.g. '/posts?page={page}').
    href(template) {
      hrefTemplate = template
      return self
    },
    siblings(n) {
      siblings = Math.max(0, n | 0)
      return self
    },
    prevLabel(text) {
      prevLabel = text
      return self
    },
    nextLabel(text) {
      nextLabel = text
      return self
    },
    build() {
      return {
        block: 'pagination',
        page: page ?? 1,
        pageCount: pageCount ?? 1,
        siblings,
        prevLabel,
        nextLabel,
        ...(hrefTemplate !== undefined ? { hrefTemplate } : {}),
      }
    },
  }
  return self
}

// Resolve the current page / total + the href template + labels. The renderer computes which page
// numbers to show (paginationRange) and draws the links; there's no live state.
registerBlock('pagination', {
  category: 'navigation',
  summary: "A page navigator (current of total).",
  example: "pagination(3, 10)",
  resolve({ props }) {
    return {
      page: props.page ?? 1,
      pageCount: props.pageCount ?? 1,
      // Clamp here too, so a hand-written `{ block:'pagination', siblings:-5 }` (which skips the
      // builder's guard) can't reach paginationRange with a negative count.
      siblings: Math.max(0, (props.siblings ?? 1) | 0),
      prevLabel: props.prevLabel ?? 'Previous',
      nextLabel: props.nextLabel ?? 'Next',
      hrefTemplate: props.hrefTemplate ?? null,
    }
  },
})
