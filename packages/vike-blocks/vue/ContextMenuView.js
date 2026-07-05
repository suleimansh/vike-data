// The Vue renderer for the `context-menu` block — the Vue twin of react/ContextMenuView.jsx. A non-modal
// menu Teleported to <body> and pinned at the cursor: right-clicking the wrapped region opens it, it
// measures itself + flips at the viewport edge (clampMenuPosition), then reveals + focuses the first
// item. Reuses the dropdown menu chrome (item / separator / heading + DROPDOWN_STYLE_TAG + moveMenuFocus)
// and the popover surface box. Closes on outside pointer-down / Escape / scroll / resize / pick. The
// Teleport is gated on a mounted flag so SSR emits only the trigger = no hydration mismatch.
import { h, ref, onMounted, onBeforeUnmount, nextTick, watch, Teleport } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import { popoverSurfaceStyle } from '../blocks/popover-styles.js'
import { dropdownItemStyle, dropdownSeparatorStyle, dropdownHeadingStyle, DROPDOWN_STYLE_TAG, moveMenuFocus } from '../blocks/dropdown-styles.js'
import { clampMenuPosition, contextTriggerStyle, contextPanelStyle } from '../blocks/context-menu-styles.js'

export const ContextMenuView = {
  props: ['items', 'trigger'],
  setup(props) {
    const open = ref(false)
    const cursor = ref({ x: 0, y: 0 })
    const pos = ref({ left: 0, top: 0 })
    const visible = ref(false)
    const mounted = ref(false)
    const panelEl = ref(null)
    const menuEl = ref(null)
    let lastFocused = null

    onMounted(() => (mounted.value = true))

    const close = () => (open.value = false)
    const openAt = (e) => {
      e.preventDefault()
      // Capture the opener only on a fresh open — re-right-clicking while open must not overwrite it with
      // a menu item that unmounts on close (which would drop focus instead of restoring it).
      if (!open.value && typeof document !== 'undefined') lastFocused = document.activeElement
      cursor.value = { x: e.clientX, y: e.clientY }
      visible.value = false
      open.value = true
    }

    const onDown = (e) => {
      if (panelEl.value && !panelEl.value.contains(e.target)) close()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') close()
    }
    const onShift = () => close()
    const bind = () => {
      document.addEventListener('pointerdown', onDown, true)
      document.addEventListener('keydown', onKey)
      window.addEventListener('scroll', onShift, true)
      window.addEventListener('resize', onShift)
    }
    const unbind = () => {
      document.removeEventListener('pointerdown', onDown, true)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onShift, true)
      window.removeEventListener('resize', onShift)
    }

    // Measure the panel (hidden), clamp it into the viewport, reveal. Re-runs when the cursor moves
    // (a second right-click while open) as well as on the initial open.
    const place = async () => {
      await nextTick()
      if (!panelEl.value) return
      const rect = panelEl.value.getBoundingClientRect()
      pos.value = clampMenuPosition(cursor.value, { width: rect.width, height: rect.height }, { width: window.innerWidth, height: window.innerHeight })
      visible.value = true
      await nextTick()
      // Focus the first enabled item, else the menu panel itself, so an empty / all-disabled menu still
      // takes focus (Escape closes it, screen readers announce it) instead of leaving focus behind.
      ;(menuEl.value?.querySelector('[role="menuitem"]:not([aria-disabled="true"])') || panelEl.value)?.focus()
    }

    watch(open, (isOpen) => {
      if (isOpen) {
        bind()
        place()
      } else {
        unbind()
        if (lastFocused) {
          lastFocused.focus?.()
          lastFocused = null
        }
      }
    })
    watch(cursor, () => {
      if (open.value) place()
    })

    onBeforeUnmount(unbind)

    const onMenuKeydown = (e) => {
      if (moveMenuFocus(menuEl.value, e.key)) e.preventDefault()
    }

    return () => {
      const items = props.items ?? []
      const triggerNode = props.trigger ? h(Blocks, { sections: [props.trigger] }) : h('div', { style: contextTriggerStyle() }, 'Right-click here')
      const region = h('div', { onContextmenu: openAt }, triggerNode)

      let menu = null
      if (open.value && mounted.value) {
        const rows = items.map((it, i) => {
          if (it.type === 'separator') return h('div', { key: i, role: 'separator', style: dropdownSeparatorStyle() })
          if (it.type === 'heading') return h('div', { key: i, style: dropdownHeadingStyle() }, it.label)
          const common = {
            role: 'menuitem',
            class: 'vike-blocks-menuitem',
            'aria-disabled': it.disabled ? 'true' : undefined,
            style: dropdownItemStyle(!!it.disabled),
            onClick: (e) => {
              if (it.disabled) {
                e.preventDefault()
                return
              }
              close()
            },
          }
          return it.to != null && !it.disabled ? h('a', { key: i, href: it.to, ...common }, it.label) : h('button', { key: i, type: 'button', disabled: it.disabled, ...common }, it.label)
        })
        menu = h(Teleport, { to: 'body' }, [
          h(
            'div',
            {
              ref: (el) => (panelEl.value = el),
              role: 'menu',
              tabindex: -1,
              style: { ...popoverSurfaceStyle(), ...contextPanelStyle(pos.value, visible.value) },
              onKeydown: onMenuKeydown,
              onContextmenu: (e) => e.preventDefault(),
            },
            [h('style', DROPDOWN_STYLE_TAG), h('div', { ref: (el) => (menuEl.value = el) }, rows)],
          ),
        ])
      }

      return h('div', { 'data-slot': 'context-menu', style: { display: 'inline-block' } }, [region, menu])
    }
  },
}

registerBlockRenderer('context-menu', ContextMenuView)
