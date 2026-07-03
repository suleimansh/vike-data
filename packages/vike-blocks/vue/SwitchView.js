// The Vue renderer for the `switch` block — the Vue twin of react/SwitchView.jsx, a dep-free,
// theme-native toggle with an animated sliding thumb. A stateful component (setup + ref) that toggles
// its own visual state (binding is the actions axis #385). `checked` is the INITIAL state so SSR and
// the first client render agree. Shares the track fill + thumb slide with the React renderer via
// switch-styles, so they can't drift.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { switchRootStyle, switchTrackStyle, switchThumbStyle, SWITCH_STYLE_TAG } from '../blocks/switch-styles.js'

export const SwitchView = {
  props: ['label', 'checked', 'disabled', 'name'],
  setup(props) {
    const on = ref(!!props.checked)
    return () => [
      h('style', SWITCH_STYLE_TAG),
      h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': on.value,
          name: props.name,
          disabled: props.disabled || undefined,
          class: 'vike-blocks-switch',
          'data-slot': 'switch',
          onClick: () => (on.value = !on.value),
          style: switchRootStyle(props.disabled),
        },
        [
          h('span', { style: switchTrackStyle(on.value) }, [h('span', { style: switchThumbStyle(on.value) })]),
          props.label != null ? h('span', props.label) : null,
        ],
      ),
    ]
  },
}

registerBlockRenderer('switch', SwitchView)
