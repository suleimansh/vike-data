// The Vue renderer for the `message` block — the Vue twin of react/MessageView.jsx, a static,
// theme-native chat message: an avatar on the sender's outer side, an author + timestamp header, and
// the composed bubble (a resolved nested block drawn with <Blocks>). Layout + colors are shared with
// the React renderer via message-styles, so they can't drift.
import { h } from 'vue'
import { Blocks } from './Blocks.js'
import { registerBlockRenderer } from './registry.js'
import {
  messageRowStyle,
  messageAvatarStyle,
  messageColumnStyle,
  messageHeaderStyle,
  messageAuthorStyle,
  messageTimeStyle,
  avatarInitials,
} from '../blocks/message-styles.js'

export const MessageView = (props) => {
  const from = props.from ?? 'assistant'
  const hasHeader = props.author != null || props.at != null
  const column = [
    hasHeader
      ? h('span', { style: messageHeaderStyle(from) }, [
          props.author != null ? h('span', { style: messageAuthorStyle }, props.author) : null,
          props.at != null ? h('span', { style: messageTimeStyle }, props.at) : null,
        ])
      : null,
    props.bubble ? h(Blocks, { sections: [props.bubble] }) : null,
  ]
  return h('div', { 'data-slot': 'message', 'data-from': from, style: messageRowStyle(from) }, [
    h('span', { 'data-slot': 'message-avatar', style: messageAvatarStyle(from) }, avatarInitials(props.author, from)),
    h('span', { style: messageColumnStyle(from) }, column),
  ])
}
MessageView.props = ['from', 'author', 'at', 'bubble']

registerBlockRenderer('message', MessageView)
