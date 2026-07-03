// The `bubble` block — a single chat message bubble, sender-aligned, for AI chat UIs. `bubble(text)`
// holds a plain string; `bubble([blocks])` holds a rich body (e.g. a markdown block), resolved
// recursively like a card. `.from('user' | 'assistant')` aligns and colors it (user right + primary,
// assistant left + surface; default assistant). The renderer is static.
//
//   bubble('How do I add a migration?').from('user')
//   bubble([markdown('Run **`pnpm rudder migrate`**.')]).from('assistant')
import { registerBlock } from '../core/registry.js'
import { resolvePage } from '../core/page.js'

const collapse = (sections) => (sections ?? []).map((s) => (typeof s?.build === 'function' ? s.build() : s))

// A fluent builder for a bubble. `content` is a string (plain text) or an array of blocks (rich body).
export function bubble(content) {
  const text = typeof content === 'string' ? content : undefined
  const sections = Array.isArray(content) ? collapse(content) : undefined
  let from = 'assistant'
  const self = {
    from(who) {
      from = who
      return self
    },
    build() {
      return {
        block: 'bubble',
        from,
        ...(text !== undefined ? { text } : {}),
        ...(sections !== undefined ? { sections: sections.map((s) => ({ ...s })) } : {}),
      }
    },
  }
  return self
}

// Resolve the sender + the body (a nested block composition resolves recursively; a plain string
// passes through). The renderer aligns and colors the bubble by sender.
registerBlock('bubble', {
  resolve({ props, tables }) {
    return {
      from: props.from === 'user' ? 'user' : 'assistant',
      text: props.text ?? null,
      sections: props.sections ? resolvePage({ sections: collapse(props.sections) }, tables).sections : null,
    }
  },
})
