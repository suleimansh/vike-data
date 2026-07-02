// The Vue renderer for the `field` block — the Vue twin of react/FieldView.jsx, a from-scratch,
// theme-native form-field shell: a label above its control, then an optional description, then an
// optional error. The control is a resolved nested block drawn with <Blocks>, so a field wraps any
// control. Wrapping the control in the <label> gives an implicit association with no generated ids.
import { h } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'

export const FieldView = (props) => {
  const { label, description, error, control } = props
  const controls = control ? [control] : []
  const children = [
    h('label', { 'data-slot': 'field-label', style: { display: 'block' } }, [
      label != null
        ? h('span', { style: { display: 'block', fontSize: '13px', fontWeight: 500, color: 'var(--color-text, #0f172a)', margin: '0 0 0.35rem' } }, label)
        : null,
      h(Blocks, { sections: controls }),
    ]),
  ]
  if (description != null) {
    children.push(
      h('p', { 'data-slot': 'field-description', style: { margin: '0.35rem 0 0', fontSize: '13px', color: 'var(--color-muted, #64748b)', lineHeight: 1.5 } }, description),
    )
  }
  if (error != null) {
    children.push(
      h('p', { 'data-slot': 'field-error', role: 'alert', style: { margin: '0.35rem 0 0', fontSize: '13px', color: 'var(--color-danger, #dc2626)', lineHeight: 1.5 } }, error),
    )
  }
  return h('div', { 'data-slot': 'field', style: { margin: '0 0 1rem' } }, children)
}
FieldView.props = ['label', 'description', 'error', 'control']

registerBlockRenderer('field', FieldView)
