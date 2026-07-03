// The React renderer for the `alert` block — the shadcn Radix alert surface: a bordered box with a
// bare accent icon, a medium-weight title, and a muted description. Theme-native; the per-intent
// style comes from the shared alert-styles module, so this stays a thin binding and can't drift from
// the Vue twin. A leaf, no state.
import { registerBlockRenderer } from './registry.js'
import { alertStyles, intentKey } from '../blocks/alert-styles.js'

export function AlertView({ title, intent = 'info', body }) {
  const s = alertStyles(intent)
  return (
    <div role="alert" data-slot="alert" data-intent={intentKey(intent)} style={s.box}>
      <span aria-hidden="true" style={s.iconStyle}>
        {s.icon}
      </span>
      <div>
        {title && <strong style={s.titleStyle}>{title}</strong>}
        {body && <p style={s.bodyStyle(!!title)}>{body}</p>}
      </div>
    </div>
  )
}

registerBlockRenderer('alert', AlertView)
