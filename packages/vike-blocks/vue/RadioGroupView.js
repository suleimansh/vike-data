// The Vue renderer for the `radio` block — the Vue twin of react/RadioGroupView.jsx, a dep-free,
// theme-native radio group with an animated selection. A stateful component (setup + ref) that tracks
// the selected option locally (binding is the actions axis #385). `value` is the INITIAL selection so
// SSR and the first client render agree. Shares the circle / dot / focus ring with the React renderer
// via radio-styles, so they can't drift.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { radioRootStyle, radioOptionStyle, radioCircleStyle, radioDotStyle, RADIO_STYLE_TAG } from '../radio-styles.js'

export const RadioGroupView = {
  props: ['options', 'value', 'name', 'disabled'],
  setup(props) {
    const selected = ref(props.value ?? null)
    return () => {
      const options = props.options ?? []
      const buttons = options.map((opt) => {
        const on = opt.value === selected.value
        return h(
          'button',
          {
            key: opt.value,
            type: 'button',
            role: 'radio',
            'aria-checked': on,
            name: props.name,
            disabled: props.disabled || undefined,
            class: 'vike-blocks-radio',
            'data-slot': 'radio',
            onClick: () => (selected.value = opt.value),
            style: radioOptionStyle(props.disabled),
          },
          [
            h('span', { style: radioCircleStyle(on) }, [h('span', { style: radioDotStyle(on) })]),
            opt.label != null ? h('span', opt.label) : null,
          ],
        )
      })
      return [h('style', RADIO_STYLE_TAG), h('div', { role: 'radiogroup', 'data-slot': 'radio-group', style: radioRootStyle() }, buttons)]
    }
  },
}

registerBlockRenderer('radio', RadioGroupView)
