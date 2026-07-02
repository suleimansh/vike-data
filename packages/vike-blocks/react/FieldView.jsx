// The React renderer for the `field` block — a from-scratch, theme-native form-field shell: a label
// above its control, then an optional description, then an optional error. The control is a resolved
// nested block drawn with <Blocks>, so a field wraps any control (input today). Wrapping the control
// in the <label> gives an implicit label/control association with no generated ids. No state.
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'

export function FieldView({ label, description, error, control }) {
  const controls = control ? [control] : []
  return (
    <div data-slot="field" style={{ margin: '0 0 1rem' }}>
      <label data-slot="field-label" style={{ display: 'block' }}>
        {label != null && (
          <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text, #0f172a)', margin: '0 0 0.35rem' }}>{label}</span>
        )}
        <Blocks sections={controls} />
      </label>
      {description != null && (
        <p data-slot="field-description" style={{ margin: '0.35rem 0 0', fontSize: 13, color: 'var(--color-muted, #64748b)', lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      {error != null && (
        <p data-slot="field-error" role="alert" style={{ margin: '0.35rem 0 0', fontSize: 13, color: 'var(--color-danger, #dc2626)', lineHeight: 1.5 }}>
          {error}
        </p>
      )}
    </div>
  )
}

registerBlockRenderer('field', FieldView)
