// The `confirm` block — an alert dialog that guards a (usually destructive) action, harvested from
// shadcn's AlertDialog. Unlike `dialog` (a free-form modal that holds nested blocks), a confirm is a
// fixed shape: a title + description + a Cancel / Confirm pair. It is SELF-CONTAINED and works with no
// client JS: given an `.action()` it owns a real `<form>`, so the trigger submits natively when JS is
// off, and when JS is on the submit is intercepted and gated behind the themed dialog (replacing a raw
// window.confirm). Without `.action()` it can navigate on confirm (`.to()`) or just close.
//
//   confirm('Delete')                     // the trigger / submit button label
//     .title('Delete this post?')
//     .description('This cannot be undone.')
//     .confirmLabel('Delete')
//     .danger()                           // red confirm button + trigger
//     .action('/posts/42', 'post')        // native form target; no-JS submits directly
//     .field('_action', 'delete')         // hidden field(s) posted with it
//
// The confirm/cancel buttons reuse the button block's styles. The mutation itself (the POST / nav) is
// the action; open/close is local UI state in the renderer.
import { registerBlock } from '../core/registry.js'

// A fluent builder for a confirm block. `label` is the trigger (and default confirm) text.
export function confirm(label) {
  let title = 'Are you sure?'
  let description
  let confirmLabel
  let cancelLabel = 'Cancel'
  let intent = 'primary'
  let link = false
  let action
  let to
  const fields = []
  const self = {
    title(v) {
      title = v
      return self
    },
    description(v) {
      description = v
      return self
    },
    confirmLabel(v) {
      confirmLabel = v
      return self
    },
    cancelLabel(v) {
      cancelLabel = v
      return self
    },
    danger() {
      intent = 'danger'
      return self
    },
    // Render the trigger as a compact text link (no button chrome) — for table rows / dense UIs.
    link() {
      link = true
      return self
    },
    // The native form target the confirm submits to. `.field()` adds hidden inputs posted with it.
    action(href, method = 'post') {
      action = { to: href, method: method === 'get' ? 'get' : 'post' }
      return self
    },
    field(name, value) {
      fields.push({ name, value: String(value) })
      return self
    },
    // Navigate here on confirm instead of submitting a form (a plain link confirmation).
    to(href) {
      to = href
      return self
    },
    build() {
      return {
        block: 'confirm',
        label: label ?? 'Confirm',
        title,
        confirmLabel: confirmLabel ?? label ?? 'Confirm',
        cancelLabel,
        intent,
        ...(description !== undefined ? { description } : {}),
        ...(link ? { link: true } : {}),
        ...(action ? { action } : {}),
        ...(fields.length ? { fields: fields.map((f) => ({ ...f })) } : {}),
        ...(to !== undefined ? { to } : {}),
      }
    },
  }
  return self
}

// Resolve the labels + intent + the action/nav target. The renderer owns the live open state; this is
// a pass-through of the declared confirmation.
registerBlock('confirm', {
  resolve({ props }) {
    return {
      label: props.label ?? 'Confirm',
      title: props.title ?? 'Are you sure?',
      description: props.description ?? null,
      confirmLabel: props.confirmLabel ?? props.label ?? 'Confirm',
      cancelLabel: props.cancelLabel ?? 'Cancel',
      intent: props.intent === 'danger' ? 'danger' : 'primary',
      link: props.link ?? false,
      action: props.action ?? null,
      fields: props.fields ?? [],
      to: props.to ?? null,
    }
  },
})
