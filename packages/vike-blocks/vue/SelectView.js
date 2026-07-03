// The Vue renderer for the `select` block — the Vue twin of react/SelectView.jsx, a dep-free,
// theme-native single-choice control over a native <select> with our chevron. A stateful component
// (setup + ref) that tracks the selected value locally (binding is the actions axis #385). `value`
// is the INITIAL selection so SSR and the first client render agree. Shares the box / chevron / focus
// ring with the React renderer via select-styles, so they can't drift.
import { h, ref } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { selectWrapStyle, selectStyle, selectChevronStyle, SELECT_STYLE_TAG } from '../select-styles.js'

export const SelectView = {
  props: ['options', 'value', 'placeholder', 'name', 'disabled'],
  setup(props) {
    const selected = ref(props.value ?? '')
    return () => {
      const options = props.options ?? []
      const onPlaceholder = props.placeholder != null && (selected.value === '' || selected.value == null)
      const optionNodes = []
      if (props.placeholder != null) optionNodes.push(h('option', { value: '', disabled: true }, props.placeholder))
      for (const opt of options) {
        optionNodes.push(h('option', { key: String(opt.value), value: opt.value, disabled: opt.disabled || undefined }, opt.label))
      }
      return h('span', { style: selectWrapStyle() }, [
        h('style', SELECT_STYLE_TAG),
        h(
          'select',
          {
            class: 'vike-blocks-select',
            'data-slot': 'select',
            'data-placeholder': onPlaceholder ? 'true' : undefined,
            name: props.name,
            disabled: props.disabled || undefined,
            value: selected.value ?? '',
            onChange: (e) => (selected.value = e.target.value),
            style: selectStyle(props.disabled),
          },
          optionNodes,
        ),
        h('span', { 'aria-hidden': 'true', style: selectChevronStyle() }, '▾'),
      ])
    }
  },
}

registerBlockRenderer('select', SelectView)
