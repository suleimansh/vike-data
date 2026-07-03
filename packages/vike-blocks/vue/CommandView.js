// The Vue renderer for the `command` block — the Vue twin of react/CommandView.jsx, a dep-free,
// theme-native ⌘K command palette on the shared Overlay primitive. A trigger button and a global
// ⌘K / Ctrl+K hotkey open the modal; the search input filters the grouped items, arrow-keys move the
// active item, Enter runs it (navigates to `to`). SSR renders only the trigger (the modal is client +
// open-gated). Shares the styles + filter with the React renderer via command-styles.
import { h, ref, onMounted, onUnmounted } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { Overlay, ENTER_MS } from './overlay.js'
import { OVERLAY_EASE, OVERLAY_BACKDROP_EASE } from '../overlay-motion.js'
import {
  filterCommands,
  SEARCH_ICON,
  commandTriggerStyle,
  commandKbdStyle,
  commandInputWrapStyle,
  commandInputStyle,
  commandListStyle,
  commandGroupHeadingStyle,
  commandItemStyle,
  commandShortcutStyle,
  commandEmptyStyle,
  COMMAND_STYLE_TAG,
} from '../command-styles.js'

const searchIcon = (size = 16) =>
  h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, [
    h('circle', { cx: SEARCH_ICON.circle.cx, cy: SEARCH_ICON.circle.cy, r: SEARCH_ICON.circle.r }),
    h('path', { d: SEARCH_ICON.path }),
  ])

const panelStyle = (visible) => ({
  width: '100%',
  maxWidth: '520px',
  background: 'var(--color-bg, #ffffff)',
  color: 'var(--color-text, #0f172a)',
  borderRadius: 'var(--radius, 12px)',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden',
  opacity: visible ? 1 : 0,
  transform: visible ? 'scale(1) translateY(0)' : 'scale(0.98) translateY(-8px)',
  transition: `opacity ${ENTER_MS}ms ${OVERLAY_BACKDROP_EASE}, transform ${ENTER_MS}ms ${OVERLAY_EASE}`,
})

export const CommandView = {
  props: ['placeholder', 'empty', 'hotkey', 'trigger', 'groups'],
  setup(props) {
    const open = ref(false)
    const query = ref('')
    const active = ref(0)
    const hotkey = () => props.hotkey ?? 'k'

    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === hotkey()) {
        e.preventDefault()
        open.value = !open.value
      }
    }
    onMounted(() => document.addEventListener('keydown', onKey))
    onUnmounted(() => document.removeEventListener('keydown', onKey))

    const select = (item) => {
      open.value = false
      query.value = ''
      if (item?.to && typeof window !== 'undefined') window.location.assign(item.to)
    }

    return () => {
      const { groups: shown, flat } = filterCommands(props.groups ?? [], query.value)

      const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          active.value = Math.min(active.value + 1, flat.length - 1)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          active.value = Math.max(active.value - 1, 0)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          const it = flat[active.value]
          if (it) select(it)
        }
      }

      const triggerBtn = h('button', { type: 'button', class: 'vike-blocks-cmd-trigger', 'data-slot': 'command-trigger', style: commandTriggerStyle(), onClick: () => { open.value = true; query.value = ''; active.value = 0 } }, [
        h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem' } }, [searchIcon(), props.trigger ?? 'Search...']),
        h('span', { style: commandKbdStyle() }, `⌘${hotkey().toUpperCase()}`),
      ])

      let idx = -1
      const listChildren =
        flat.length === 0
          ? [h('div', { 'data-slot': 'command-empty', style: commandEmptyStyle() }, props.empty ?? 'No results found.')]
          : shown.map((g, gi) =>
              h('div', { key: gi, 'data-slot': 'command-group' }, [
                g.label ? h('div', { style: commandGroupHeadingStyle() }, g.label) : null,
                ...g.items.map((it) => {
                  idx += 1
                  const myIdx = idx
                  const on = myIdx === active.value
                  return h(
                    'div',
                    {
                      key: myIdx,
                      role: 'option',
                      'data-slot': 'command-item',
                      'aria-selected': on,
                      'data-active': on ? 'true' : undefined,
                      onMouseenter: () => (active.value = myIdx),
                      onMousedown: (e) => { e.preventDefault(); select(it) },
                      style: commandItemStyle(on),
                    },
                    [h('span', it.label), it.shortcut ? h('span', { 'data-slot': 'command-shortcut', style: commandShortcutStyle() }, it.shortcut) : null],
                  )
                }),
              ]),
            )

      const panel = h('div', { 'data-slot': 'command', style: { display: 'flex', flexDirection: 'column' } }, [
        h('div', { style: commandInputWrapStyle() }, [
          searchIcon(18),
          h('input', {
            class: 'vike-blocks-cmd-input',
            'data-slot': 'command-input',
            autofocus: true,
            value: query.value,
            placeholder: props.placeholder ?? 'Type a command or search...',
            onInput: (e) => { query.value = e.target.value; active.value = 0 },
            onKeydown: onKeyDown,
            style: commandInputStyle(),
          }),
        ]),
        h('div', { role: 'listbox', 'data-slot': 'command-list', style: commandListStyle() }, listChildren),
      ])

      return h('span', { 'data-slot': 'command-root' }, [
        h('style', COMMAND_STYLE_TAG),
        triggerBtn,
        h(Overlay, { open: open.value, onClose: () => (open.value = false), role: 'dialog', containerStyle: { alignItems: 'flex-start', justifyContent: 'center', padding: '1rem', paddingTop: '12vh' }, panelStyle }, { default: () => panel }),
      ])
    }
  },
}

registerBlockRenderer('command', CommandView)
