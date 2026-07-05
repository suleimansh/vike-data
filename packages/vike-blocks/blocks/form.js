// The `form` block — a NON-schema form CONTAINER: group field/control blocks into a real,
// ready-to-post <form> with a submit button. The hand-authored counterpart to vike-crud's
// schema-derived form (FormView), which derives its fields from a table; this one takes the fields
// you compose. Scoped to NATIVE HTML submission (method + action), so it ships fully working with
// progressive enhancement and zero client JS — the JS-submission richness (named actions, optimistic
// UI, inline validation) layers on later via the actions axis (#385). Dep-free, theme-native,
// cross-framework.
//
//   form({ action: '/members', method: 'post' })
//     .fields([
//       field('Name').control(input().name('name').required()),
//       field('Role').control(radio().option('admin', 'Admin').option('member', 'Member')),
//     ])
//     .submit('Create member')
//
// The body is ordinary blocks (usually `field` + a control, but any block composes), so a form nests
// like card. `.action()` is the native submit URL; `.method()` is get|post (native forms support no
// others). `.submit(false)` drops the built-in button for a form that composes its own footer.
// `.onSubmit(name)` references a named action (the actions axis, #385): when a vike-actions provider
// is present the renderer submits the form's values to that action via JS; otherwise the native
// `action`/`method` POST is the progressive-enhancement fallback, so a form works with no client JS.
import { registerBlock } from '../core/registry.js'
import { resolvePage, collapseSections as collapse } from '../core/page.js'

// Collapse builders to plain descriptors (a no-op for descriptors already), so `.fields([...])`
// accepts fluent builders and `resolve` gets `{ block, ...props }` objects — same as card's sections.

// A fluent builder for a form block. `form({ action, method, fields })` seeds it; the chainable
// setters override. `.fields()` collapses now so nested builders work; `.submit(label)` sets the
// primary submit label (or `false` to omit the button).
export function form({ action, method, fields, onSubmit } = {}) {
  let body = collapse(fields)
  let act = action
  let httpMethod = method
  let submitLabel
  let submitAction = onSubmit
  const self = {
    action(url) {
      act = url
      return self
    },
    method(m) {
      httpMethod = m
      return self
    },
    fields(next = []) {
      body = collapse(next)
      return self
    },
    submit(label) {
      submitLabel = label
      return self
    },
    onSubmit(name) {
      submitAction = name
      return self
    },
    build() {
      return {
        block: 'form',
        ...(act !== undefined ? { action: act } : {}),
        ...(httpMethod !== undefined ? { method: httpMethod } : {}),
        ...(submitLabel !== undefined ? { submitLabel } : {}),
        ...(submitAction !== undefined ? { onSubmit: submitAction } : {}),
        fields: body.map((b) => ({ ...b })),
      }
    },
  }
  return self
}

// Resolve the field blocks into serializable view-models — the recursive step that makes the form a
// container. action/method/submitLabel pass through (normalized); the renderer draws the <form>, the
// fields, and the submit button.
registerBlock('form', {
  category: 'form',
  container: true,
  summary: 'A native <form> (method + action) wrapping field controls.',
  example: "form({ action: '/members', method: 'post' }).fields([field('Name').control(input().name('name'))])",
  resolve({ props, tables }) {
    return {
      action: props.action ?? null,
      method: String(props.method ?? 'post').toLowerCase(),
      submitLabel: props.submitLabel === undefined ? 'Save' : props.submitLabel,
      onSubmit: props.onSubmit ?? null,
      sections: resolvePage({ sections: collapse(props.fields) }, tables).sections,
    }
  },
})
