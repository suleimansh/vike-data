// The React renderer for the `message` block — a static, theme-native chat message: an avatar on the
// sender's outer side, an author + timestamp header, and the composed bubble (a resolved nested block
// drawn with <Blocks>). Layout + colors come from the shared message-styles module, so this stays a
// thin binding and can't drift from the Vue twin.
import { Blocks } from './Blocks.jsx'
import { registerBlockRenderer } from './registry.js'
import {
  messageRowStyle,
  messageAvatarStyle,
  messageColumnStyle,
  messageHeaderStyle,
  messageAuthorStyle,
  messageTimeStyle,
  avatarInitials,
} from '../message-styles.js'

export function MessageView({ from = 'assistant', author, at, bubble }) {
  const hasHeader = author != null || at != null
  return (
    <div data-slot="message" data-from={from} style={messageRowStyle(from)}>
      <span data-slot="message-avatar" style={messageAvatarStyle(from)}>
        {avatarInitials(author, from)}
      </span>
      <span style={messageColumnStyle(from)}>
        {hasHeader && (
          <span style={messageHeaderStyle(from)}>
            {author != null && <span style={messageAuthorStyle}>{author}</span>}
            {at != null && <span style={messageTimeStyle}>{at}</span>}
          </span>
        )}
        {bubble && <Blocks sections={[bubble]} />}
      </span>
    </div>
  )
}

registerBlockRenderer('message', MessageView)
