// The Vue renderer for the `breadcrumb` block — the Vue twin of react/BreadcrumbView.jsx, a dep-free,
// theme-native page trail. A nav > ol of crumbs: a muted <a> link for each crumb with a `to`, the last
// crumb the current page (foreground, aria-current, no link), separated by a chevron (or a custom
// string). Plain links + no state, so SSR renders the final markup. Shares the styles with the React
// renderer via breadcrumb-styles.
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { breadcrumbListStyle, breadcrumbItemStyle, breadcrumbLinkStyle, breadcrumbPageStyle, breadcrumbSeparatorStyle, CHEVRON_RIGHT_PATH, BREADCRUMB_STYLE_TAG } from '../blocks/breadcrumb-styles.js'

const chevron = () =>
  h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, [h('path', { d: CHEVRON_RIGHT_PATH })])

export const BreadcrumbView = {
  props: ['items', 'separator'],
  setup(props) {
    return () => {
      const items = props.items ?? []
      const last = items.length - 1
      const cells = []
      items.forEach((it, i) => {
        const crumb =
          i === last
            ? h('span', { 'data-slot': 'breadcrumb-page', 'aria-current': 'page', style: breadcrumbPageStyle() }, it.label)
            : it.to
              ? h('a', { href: it.to, class: 'vike-blocks-crumb', 'data-slot': 'breadcrumb-link', style: breadcrumbLinkStyle() }, it.label)
              : h('span', { style: { color: 'inherit' } }, it.label)
        cells.push(h('li', { key: `i${i}`, 'data-slot': 'breadcrumb-item', style: breadcrumbItemStyle() }, crumb))
        if (i < last) cells.push(h('li', { key: `s${i}`, role: 'presentation', 'aria-hidden': 'true', 'data-slot': 'breadcrumb-separator', style: breadcrumbSeparatorStyle() }, props.separator ?? chevron()))
      })
      return h('nav', { 'aria-label': 'breadcrumb', 'data-slot': 'breadcrumb' }, [h('style', BREADCRUMB_STYLE_TAG), h('ol', { 'data-slot': 'breadcrumb-list', style: breadcrumbListStyle() }, cells)])
    }
  },
}

registerBlockRenderer('breadcrumb', BreadcrumbView)
