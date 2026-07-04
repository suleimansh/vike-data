// The Vue renderers for the `toggle-button` + `toggle-group` blocks — the Vue twins of
// react/ToggleView.jsx. A dep-free, theme-native pressable button and segmented control: each button is
// an accessible <button aria-pressed> whose pressed state is local UI state (value binding is #385),
// initialised from the resolved `pressed` / `value` so SSR and the first client render agree. A group
// is a role="group" of connected buttons, single-select (click again to clear) or `.multiple()`. Shares
// the surface styles with the React renderers via toggle-styles, so they can't drift.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { toggleButtonStyle, toggleGroupStyle, groupPosition, TOGGLE_STYLE_TAG } from '../blocks/toggle-styles.js'

export const ToggleButtonView = {
  props: ['label', 'pressed', 'disabled'],
  setup(props) {
    const on = ref(!!props.pressed)
    return () =>
      h('span', { style: { display: 'contents' } }, [
        h('style', TOGGLE_STYLE_TAG),
        h(
          'button',
          {
            type: 'button',
            class: 'vike-blocks-toggle',
            'data-slot': 'toggle',
            'aria-pressed': on.value,
            disabled: props.disabled || undefined,
            onClick: () => (on.value = !on.value),
            style: toggleButtonStyle(on.value, !!props.disabled),
          },
          props.label ?? null,
        ),
      ])
  },
}

export const ToggleGroupView = {
  props: ['items', 'value', 'multiple', 'disabled'],
  setup(props) {
    const selected = ref(Array.isArray(props.value) ? props.value.slice() : [])
    const toggle = (v) => {
      const cur = selected.value
      if (props.multiple) selected.value = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
      else selected.value = cur.includes(v) ? [] : [v]
    }
    return () => {
      const items = props.items ?? []
      const rows = items.map((it, i) => {
        const on = selected.value.includes(it.value)
        return h(
          'button',
          {
            key: it.value,
            type: 'button',
            class: 'vike-blocks-toggle',
            'data-slot': 'toggle',
            'aria-pressed': on,
            disabled: props.disabled || undefined,
            onClick: () => toggle(it.value),
            style: toggleButtonStyle(on, !!props.disabled, { grouped: true, position: groupPosition(i, items.length) }),
          },
          it.label,
        )
      })
      return h('span', { style: { display: 'contents' } }, [
        h('style', TOGGLE_STYLE_TAG),
        h('div', { role: 'group', 'data-slot': 'toggle-group', style: toggleGroupStyle() }, rows),
      ])
    }
  },
}

registerBlockRenderer('toggle-button', ToggleButtonView)
registerBlockRenderer('toggle-group', ToggleGroupView)
