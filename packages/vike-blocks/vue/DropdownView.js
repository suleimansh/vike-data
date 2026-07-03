// The Vue renderer for the `dropdown` block — the Vue twin of react/DropdownView.jsx, a dep-free,
// theme-native menu anchored below its trigger. Reuses the popover primitive (anchor + outside-click +
// Escape + open-gated SSR) and adds roving arrow-key focus between items. Each item is a role="menuitem"
// (a link when `to` is set, else a button — the mutating behaviour is the actions axis #385); picking
// one closes the menu. It tracks its own open state, so SSR renders only the trigger (no hydration
// mismatch). Shares the trigger / item / panel styles with the React renderer via dropdown/popover-styles.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { Popover } from './popover.js'
import { popoverSurfaceStyle, popoverMotionStyle } from '../blocks/popover-styles.js'
import { dropdownPlacement, dropdownTriggerStyle, dropdownItemStyle, dropdownSeparatorStyle, dropdownHeadingStyle, DROPDOWN_STYLE_TAG, moveMenuFocus } from '../blocks/dropdown-styles.js'

export const DropdownView = {
  props: ['label', 'items', 'align', 'side'],
  setup(props) {
    const open = ref(false)
    const menuEl = ref(null)

    return () => {
      const label = props.label ?? 'Menu'
      const items = props.items ?? []
      const placement = dropdownPlacement(props.side, props.align)

      const trigger = h('span', { style: { display: 'contents' } }, [
        h('style', DROPDOWN_STYLE_TAG),
        h(
          'button',
          {
            type: 'button',
            class: 'vike-blocks-menutrigger',
            'aria-haspopup': 'menu',
            'aria-expanded': open.value,
            style: dropdownTriggerStyle(),
            onClick: () => (open.value = !open.value),
          },
          [h('span', label), h('span', { 'aria-hidden': 'true', style: { fontSize: '11px' } }, '▾')],
        ),
      ])

      const onKeyDown = (e) => {
        if (moveMenuFocus(menuEl.value, e.key)) e.preventDefault()
      }

      const rows = items.map((it, i) => {
        if (it.type === 'separator') return h('div', { key: i, role: 'separator', style: dropdownSeparatorStyle() })
        if (it.type === 'heading') return h('div', { key: i, style: dropdownHeadingStyle() }, it.label)
        const onClick = (e) => {
          if (it.disabled) {
            e.preventDefault()
            return
          }
          open.value = false
        }
        const common = { key: i, role: 'menuitem', class: 'vike-blocks-menuitem', 'aria-disabled': it.disabled ? 'true' : undefined, style: dropdownItemStyle(!!it.disabled), onClick }
        return it.to != null && !it.disabled ? h('a', { ...common, href: it.to }, it.label) : h('button', { ...common, type: 'button', disabled: it.disabled || undefined }, it.label)
      })

      return h(
        Popover,
        {
          open: open.value,
          onClose: () => (open.value = false),
          trigger,
          placement,
          role: 'menu',
          panelStyle: (v, pl) => ({ ...popoverSurfaceStyle(), ...popoverMotionStyle(v, pl) }),
        },
        { default: () => h('div', { ref: menuEl, onKeydown: onKeyDown, 'data-slot': 'dropdown-menu' }, rows) },
      )
    }
  },
}

registerBlockRenderer('dropdown', DropdownView)
