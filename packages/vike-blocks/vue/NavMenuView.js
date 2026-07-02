// The Vue renderer for the `nav-menu` block — the Vue twin of react/NavMenuView.jsx, a dep-free,
// theme-native navigation bar. Top-level links are plain <a>; a group's trigger opens a dropdown of
// links anchored below it, reusing the popover primitive (anchor + outside-click + Escape + open-gated
// SSR) and the dropdown's roving arrow-key nav. One section is open at a time (openIndex local state),
// so opening one closes the others. SSR renders the bar but no open panel, so there's no hydration
// mismatch. Shares the bar / trigger / group-link styles with the React renderer via nav-menu/popover-styles.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.js'
import { popoverSurfaceStyle, popoverMotionStyle } from '../popover-styles.js'
import { moveMenuFocus } from '../dropdown-styles.js'
import { navRootStyle, navLinkStyle, navTriggerStyle, navGroupLinkStyle, navGroupLinkTitleStyle, navGroupLinkDescStyle, navGroupPanelStyle, NAV_STYLE_TAG } from '../nav-menu-styles.js'

function groupMenu(item, open, onToggle, onClose) {
  const trigger = h(
    'button',
    { type: 'button', class: 'vike-blocks-navitem', 'aria-haspopup': 'menu', 'aria-expanded': open, style: navTriggerStyle(open), onClick: onToggle },
    [h('span', item.label), h('span', { 'aria-hidden': 'true', style: { fontSize: '11px' } }, '▾')],
  )
  const rows = (item.links ?? []).map((l, i) => {
    const inner = [h('span', { style: navGroupLinkTitleStyle() }, l.label), l.description != null ? h('span', { style: navGroupLinkDescStyle() }, l.description) : null]
    const common = { key: i, role: 'menuitem', class: 'vike-blocks-navlink', style: navGroupLinkStyle(), onClick: onClose }
    return l.to != null ? h('a', { ...common, href: l.to }, inner) : h('button', { ...common, type: 'button' }, inner)
  })
  return h(
    Popover,
    { open, onClose, trigger, placement: 'bottom-start', role: 'menu', panelStyle: (v, pl) => ({ ...popoverSurfaceStyle(), ...navGroupPanelStyle(), ...popoverMotionStyle(v, pl) }) },
    { default: () => h('div', { onKeydown: (e) => moveMenuFocus(e.currentTarget, e.key) && e.preventDefault(), 'data-slot': 'nav-group' }, rows) },
  )
}

export const NavMenuView = {
  props: ['items'],
  setup(props) {
    const openIndex = ref(-1)
    return () => {
      const items = props.items ?? []
      const bar = items.map((it, i) =>
        it.type === 'group'
          ? groupMenu(
              it,
              openIndex.value === i,
              () => (openIndex.value = openIndex.value === i ? -1 : i),
              () => {
                if (openIndex.value === i) openIndex.value = -1
              },
            )
          : h('a', { key: i, href: it.to ?? '#', class: 'vike-blocks-navlink', style: navLinkStyle() }, it.label),
      )
      return h('nav', { 'data-slot': 'nav-menu', style: navRootStyle() }, [h('style', NAV_STYLE_TAG), ...bar])
    }
  },
}

registerBlockRenderer('nav-menu', NavMenuView)
