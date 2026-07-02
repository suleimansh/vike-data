// The React renderer for the `button` block — the shadcn Base button surface, theme-native (every
// color is a vike-themes CSS var). `to` renders an <a> styled as a button (declarative nav);
// `action` wires the click to the named action via the action-context runner (#385); otherwise a
// plain <button>. Variant/size/hover/focus-ring/disabled all come from the shared button-styles
// module, so this stays a thin binding and can't drift from the Vue twin.
import { registerBlockRenderer } from './registry.js'
import { useActionRunner } from './action-context.js'
import { buttonStyle, variantKey, BUTTON_STYLE_TAG } from '../button-styles.js'

export function ButtonView({ label, variant = 'default', to, size = 'default', disabled = false, action, params }) {
  const runner = useActionRunner()
  const style = buttonStyle(variant, size, disabled)
  const common = { className: 'vike-blocks-btn', 'data-slot': 'button', 'data-variant': variantKey(variant), style }
  // A named action runs through the provided runner; with no provider the default is inert, so the
  // button renders but does nothing until vike-actions is mounted.
  const onClick = action && !disabled ? () => runner.run(action, params) : undefined
  return (
    <>
      <style>{BUTTON_STYLE_TAG}</style>
      {to ? (
        // An <a> has no `disabled`; mark it aria-disabled + drop it from the tab order and strip the
        // href so a disabled link-button neither navigates nor focuses.
        <a href={disabled ? undefined : to} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : undefined} {...common}>
          {label}
        </a>
      ) : (
        <button type="button" disabled={disabled} onClick={onClick} {...common}>
          {label}
        </button>
      )}
    </>
  )
}

registerBlockRenderer('button', ButtonView)
