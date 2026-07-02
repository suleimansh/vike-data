// The Vue renderer for the `form` block — the Vue twin of react/FormView.jsx. A functional
// component (no state — native submission does the work): the resolved field sections drawn with
// <Blocks>, then a submit button styled from the shared button module so it can't drift from the
// React renderer.
import { h } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import { buttonStyle, BUTTON_STYLE_TAG } from '../button-styles.js'

export const FormView = {
  props: ['action', 'method', 'submitLabel', 'sections'],
  setup(props) {
    return () => {
      const submitLabel = props.submitLabel === undefined ? 'Save' : props.submitLabel
      const children = [h(Blocks, { sections: props.sections ?? [] })]
      if (submitLabel) {
        children.push(
          h('div', [
            h('style', BUTTON_STYLE_TAG),
            h('button', { type: 'submit', class: 'vike-blocks-btn', 'data-slot': 'form-submit', style: buttonStyle('default', 'default', false) }, submitLabel),
          ]),
        )
      }
      return h('form', { method: props.method ?? 'post', action: props.action || undefined, 'data-slot': 'form', style: { display: 'grid', gap: '1rem' } }, children)
    }
  },
}

registerBlockRenderer('form', FormView)
