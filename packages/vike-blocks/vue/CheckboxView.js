// The Vue renderer for the `checkbox` block — the Vue twin of react/CheckboxView.jsx, a dep-free,
// theme-native boolean control with an animated check. A stateful component (setup + ref) that
// toggles its own visual state (local UI state; binding is the actions axis #385). `checked` is the
// INITIAL state so SSR and the first client render agree. Shares the box fill + check spring with the
// React renderer via checkbox-styles, so they can't drift.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { checkboxRootStyle, checkboxBoxStyle, checkStyle, CHECKBOX_STYLE_TAG } from '../blocks/checkbox-styles.js'

const check = (checked) =>
  h(
    'svg',
    {
      'aria-hidden': 'true',
      width: '12',
      height: '12',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'var(--color-primary-text, #ffffff)',
      'stroke-width': '3.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      style: checkStyle(checked),
    },
    [h('polyline', { points: '20 6 9 17 4 12' })],
  )

export const CheckboxView = {
  props: ['label', 'checked', 'disabled', 'name'],
  setup(props) {
    const on = ref(!!props.checked)
    return () => [
      h('style', CHECKBOX_STYLE_TAG),
      h(
        'button',
        {
          type: 'button',
          role: 'checkbox',
          'aria-checked': on.value,
          name: props.name,
          disabled: props.disabled || undefined,
          class: 'vike-blocks-checkbox',
          'data-slot': 'checkbox',
          onClick: () => (on.value = !on.value),
          style: checkboxRootStyle(props.disabled),
        },
        [h('span', { style: checkboxBoxStyle(on.value) }, [check(on.value)]), props.label != null ? h('span', props.label) : null],
      ),
    ]
  },
}

registerBlockRenderer('checkbox', CheckboxView)
