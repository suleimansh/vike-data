// The Vue renderer for the `doc-nav` block — the Vue twin of react/DocNavView.jsx. A documentation
// sidebar tree: collapsible categories over a shared style module. Which categories are open is local
// state, SEEDED from each group's `active` flag (the category holding the current page starts open),
// so the server and the first client render agree = no hydration mismatch. The active page's on-page
// sections splice in beneath it.
import { h, reactive, Fragment } from 'vue'
import { registerBlockRenderer } from './registry.js'
import {
  docNavRootStyle,
  docNavGroupStyle,
  docNavHeaderStyle,
  docNavHeaderTextStyle,
  docNavLinkStyle,
  docNavSectionStyle,
  docNavChevronStyle,
  DOC_NAV_STYLE_TAG,
} from '../blocks/doc-nav-styles.js'

const chevron = (open) =>
  h(
    'svg',
    {
      class: 'vike-blocks-docnav-chevron',
      'aria-hidden': 'true',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      style: docNavChevronStyle(open),
    },
    [h('polyline', { points: '6 9 12 15 18 9' })],
  )

// A page link plus (when it is the current page) its on-page sections spliced beneath it. Wrapped in a
// keyed Fragment (the anchor + its sections are siblings) to match the React twin's keyed <PageLink>.
function pageLink(link, key) {
  const anchor = h(
    'a',
    { href: link.href ?? undefined, class: 'vike-blocks-docnav-link', 'aria-current': link.active ? 'page' : undefined, style: docNavLinkStyle(link.active) },
    link.label,
  )
  if (!link.active || !(link.sections ?? []).length) return h(Fragment, { key }, [anchor])
  const sections = (link.sections ?? []).map((s, i) =>
    h('a', { key: i, href: s.href ?? undefined, class: 'vike-blocks-docnav-section', style: docNavSectionStyle() }, s.label),
  )
  return h(Fragment, { key }, [anchor, ...sections])
}

export const DocNavView = {
  props: ['items', 'collapsible', 'current'],
  setup(props) {
    const collapsible = props.collapsible !== false
    // Seed open state from each group's active flag (relevant category open, rest collapsed).
    const open = reactive({})
    ;(props.items ?? []).forEach((it, i) => {
      if (it.type === 'group') open[i] = collapsible ? !!it.active : true
    })

    return () => {
      const nodes = (props.items ?? []).map((it, i) => {
        if (it.type !== 'group') return pageLink(it, it.href ?? i)
        const isOpen = open[i]
        const header = collapsible
          ? h(
              'button',
              { type: 'button', 'aria-expanded': isOpen, onClick: () => (open[i] = !open[i]), style: docNavHeaderStyle(true) },
              [h('span', { style: docNavHeaderTextStyle(it.color) }, it.label), chevron(isOpen)],
            )
          : h('div', { style: docNavHeaderStyle(false) }, [h('span', { style: docNavHeaderTextStyle(it.color) }, it.label)])
        const body = isOpen
          ? h('div', { style: { marginTop: '0.35rem' } }, (it.links ?? []).map((link, li) => pageLink(link, link.href ?? li)))
          : null
        return h('div', { key: i, 'data-slot': 'doc-nav-group', 'data-active': it.active || undefined, style: docNavGroupStyle() }, [header, body])
      })

      return h(
        'nav',
        { 'data-slot': 'doc-nav', 'aria-label': 'Documentation', 'data-current': props.current ?? undefined, style: docNavRootStyle() },
        [h('style', DOC_NAV_STYLE_TAG), ...nodes],
      )
    }
  },
}

registerBlockRenderer('doc-nav', DocNavView)
