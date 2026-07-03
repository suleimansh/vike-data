// The Vue renderer for the `button` block — the Vue twin of react/ButtonView.jsx, the shadcn Base
// button surface. Theme-native; `to` renders an <a> styled as a button, `action` wires the click to
// the named action via the injected runner (#385), otherwise a plain <button>. Uses setup() so it
// can inject the runner; still shares the variant/size/hover/focus/disabled styling with the React
// renderer via the button-styles module, so the two can't drift.
import { h } from 'vue'
import { registerBlockRenderer } from './registry.js'
import { useActionRunner } from './action-context.js'
import { buttonStyle, variantKey, BUTTON_STYLE_TAG } from '../blocks/button-styles.js'

export const ButtonView = {
  props: ['label', 'variant', 'to', 'size', 'disabled', 'action', 'params'],
  setup(props) {
    const runner = useActionRunner()
    return () => {
      const { label, variant = 'default', to, size = 'default', disabled = false, action, params } = props
      const style = buttonStyle(variant, size, disabled)
      const common = { class: 'vike-blocks-btn', 'data-slot': 'button', 'data-variant': variantKey(variant), style }
      const styleTag = h('style', BUTTON_STYLE_TAG)
      // A named action runs through the injected runner; the inert default means no provider -> no-op.
      const onClick = action && !disabled ? () => runner.run(action, params) : undefined
      const el = to
        ? // An <a> has no `disabled`; mark it aria-disabled + drop it from the tab order and strip the
          // href so a disabled link-button neither navigates nor focuses.
          h('a', { href: disabled ? undefined : to, 'aria-disabled': disabled || undefined, tabindex: disabled ? -1 : undefined, ...common }, label)
        : h('button', { type: 'button', disabled: disabled || undefined, onClick, ...common }, label)
      return [styleTag, el]
    }
  },
}

registerBlockRenderer('button', ButtonView)
