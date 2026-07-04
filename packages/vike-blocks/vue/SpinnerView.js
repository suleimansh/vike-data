// The Vue renderer for the `spinner` block — the Vue twin of react/SpinnerView.jsx, a dep-free,
// theme-native loading spinner. The spin is pure CSS (the shared SPINNER_STYLE_TAG), so there's no JS
// and no state and SSR renders the final markup. `role="status"` announces it; a label is the
// accessible name, else a "Loading" one. Shares the styles with the React renderer via spinner-styles.
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { spinnerRingStyle, spinnerRowStyle, spinnerLabelStyle, SPINNER_STYLE_TAG } from '../blocks/spinner-styles.js'

export const SpinnerView = {
  props: ['size', 'thickness', 'tone', 'label'],
  setup(props) {
    return () => {
      const size = props.size ?? 20
      const thickness = props.thickness ?? 2
      const tone = props.tone ?? 'default'
      const labelled = props.label != null
      const children = [
        h('style', SPINNER_STYLE_TAG),
        h('span', { class: 'vike-blocks-spinner', 'data-slot': 'spinner', style: spinnerRingStyle(size, thickness, tone) }),
      ]
      if (labelled) children.push(h('span', { style: spinnerLabelStyle() }, props.label))
      return h(
        'span',
        {
          role: 'status',
          'aria-live': 'polite',
          ...(labelled ? {} : { 'aria-label': 'Loading' }),
          style: labelled ? spinnerRowStyle() : { display: 'inline-flex' },
        },
        children,
      )
    }
  },
}

registerBlockRenderer('spinner', SpinnerView)
