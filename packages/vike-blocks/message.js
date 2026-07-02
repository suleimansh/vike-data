// The `message` block — a chat message: a `bubble` plus its metadata (avatar, author, timestamp),
// for AI chat UIs. Composes the bubble block: `.body()` becomes the bubble's content (a string or a
// rich body of nested blocks) and `.from()` sets the sender for both the bubble color and the row
// alignment. `.author()` / `.at()` add the name and timestamp shown above the bubble. Static.
//
//   message().from('user').author('You').at('9:41 AM').body('How do I add a migration?')
//   message().from('assistant').author('Rudder').body([{ block: 'markdown', source: 'Run `migrate`.' }])
import { registerBlock } from './registry.js'
import { resolvePage } from './page.js'
import { bubble } from './bubble.js'

// A fluent builder for a message. The body is folded into a nested `bubble` descriptor at build time,
// so a message composes the bubble block rather than reimplementing it.
export function message() {
  let from = 'assistant'
  let author
  let at
  let body
  const self = {
    from(who) {
      from = who
      return self
    },
    author(name) {
      author = name
      return self
    },
    at(time) {
      at = time
      return self
    },
    body(content) {
      body = content
      return self
    },
    build() {
      return {
        block: 'message',
        from,
        ...(author !== undefined ? { author } : {}),
        ...(at !== undefined ? { at } : {}),
        bubble: bubble(body).from(from).build(),
      }
    },
  }
  return self
}

// Resolve the sender + metadata + the nested bubble (resolved recursively). The renderer draws the
// avatar, the author/timestamp header, and the bubble, aligned by sender.
registerBlock('message', {
  resolve({ props, tables }) {
    return {
      from: props.from === 'user' ? 'user' : 'assistant',
      author: props.author ?? null,
      at: props.at ?? null,
      bubble: props.bubble ? resolvePage({ sections: [props.bubble] }, tables).sections[0] : null,
    }
  },
})
