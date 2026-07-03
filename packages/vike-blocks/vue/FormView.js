// The Vue renderer for the `form` block — the Vue twin of react/FormView.jsx. The resolved field
// sections drawn with <Blocks>, then a submit button styled from the shared button module so it
// can't drift from the React renderer. With `onSubmit` (a named action, #385) AND a provider present
// it submits the form's values via JS; otherwise the native method/action POST does the work.
import { h } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import { useActionRunner } from './action-context.js'
import { buttonStyle, BUTTON_STYLE_TAG } from '../blocks/button-styles.js'

export const FormView = {
  props: ['action', 'method', 'submitLabel', 'onSubmit', 'sections'],
  setup(props) {
    const runner = useActionRunner()
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
      // Intercept only with a named action AND a mounted runner; else the native POST proceeds.
      const onSubmit =
        props.onSubmit && runner.enabled
          ? (e) => {
              e.preventDefault()
              runner.run(props.onSubmit, Object.fromEntries(new FormData(e.currentTarget)))
            }
          : undefined
      return h('form', { method: props.method ?? 'post', action: props.action || undefined, onSubmit, 'data-slot': 'form', style: { display: 'grid', gap: '1rem' } }, children)
    }
  },
}

registerBlockRenderer('form', FormView)
