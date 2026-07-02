// The field block demo. Each field below is the `field` container rendered through the registry
// (resolvePage + <Blocks>): a label, a control block, and an optional description / error. A field is
// control-agnostic — here it wraps `text` (a read-only value field) and `button` (an action field);
// the editable `input` block (#427) is the typical control, and once both land field wraps it directly.
import { definePage, resolvePage, field, text, button } from 'vike-blocks'
import { Blocks } from 'vike-blocks/react'

// Render a single field block from a builder.
const One = (builder) => <Blocks sections={resolvePage(definePage({ sections: [builder] })).sections} />

export default function FieldPage() {
  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Field block</h1>
      <p style={{ color: '#64748b', lineHeight: 1.6 }}>
        A form-field shell: <code>field(label).description(...).error(...).control(block)</code>. It wraps a control block with its
        label, an optional description, and an optional error, and is control-agnostic. The typical control is the editable{' '}
        <code>input</code> block (#427); below it wraps <code>text</code> (read-only value fields) and a <code>button</code>. It is the
        hand-authored field shell that vike-view's schema-derived forms can share.
      </p>

      {One(field('Plan').description('Your current subscription tier.').control(text('Pro')))}
      {One(field('Workspace').control(text('acme-inc')))}
      {One(field('Password').description('At least 8 characters.').error('This password is too short.').control(text('•••••')))}
      {One(field('Danger zone').description('This action cannot be undone.').control(button('Delete workspace').variant('destructive')))}

      <p style={{ marginTop: '1rem' }}>
        <a href="/">{'<-'} back to catalog</a>
      </p>
    </div>
  )
}
