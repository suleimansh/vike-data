// The `message-scroller` block — a scroll container for a list of chat messages that sticks to the
// bottom on new content (auto-scroll) with a jump-to-latest affordance. A CONTAINER block: each
// message is an ordinary block resolved recursively (built with `message`, but any block works).
// `.height()` caps the scroll viewport (default 24rem). The stick-to-bottom + jump button are the
// renderer's local UI state.
//
//   messageScroller([
//     message().from('user').body('Hi'),
//     message().from('assistant').body('Hello!'),
//   ]).height('20rem')
import { registerBlock } from '../core/registry.js'
import { resolvePage, collapseSections as collapse } from '../core/page.js'


// A fluent builder for a message scroller. The messages are collapsed now so builders compose.
export function messageScroller(messages = []) {
  const items = collapse(messages)
  let maxHeight
  const self = {
    height(h) {
      maxHeight = h
      return self
    },
    build() {
      return {
        block: 'message-scroller',
        messages: items.map((s) => ({ ...s })),
        ...(maxHeight !== undefined ? { maxHeight } : {}),
      }
    },
  }
  return self
}

// Resolve the message list (the recursive step that makes it a container) + the viewport height. The
// renderer draws the scroll container, sticks it to the bottom, and shows a jump-to-latest button.
registerBlock('message-scroller', {
  resolve({ props, tables }) {
    return {
      messages: resolvePage({ sections: collapse(props.messages) }, tables).sections,
      maxHeight: props.maxHeight ?? '24rem',
    }
  },
})
